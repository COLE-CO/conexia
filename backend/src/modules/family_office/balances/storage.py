import uuid
import os
import boto3
from src.core.config import settings


def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )


def generate_storage_key(company_id: int, year: int, original_filename: str) -> str:
    extension = os.path.splitext(original_filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{extension}"
    return f"balances/{company_id}/{year}/{unique_filename}"


def upload_file_to_s3(file_obj, storage_key: str, content_type: str):
    s3 = get_s3_client()

    s3.upload_fileobj(
        file_obj,
        settings.AWS_BUCKET_NAME,
        storage_key,
        ExtraArgs={"ContentType": content_type}
    )

    return storage_key


def delete_file_from_s3(storage_key: str):
    s3 = get_s3_client()
    s3.delete_object(Bucket=settings.AWS_BUCKET_NAME, Key=storage_key)


def generate_presigned_download_url(
    storage_key: str,
    original_filename: str,
    expires_in: int = 60
) -> str:
    s3 = get_s3_client()
    safe_filename = original_filename.replace('"', "")

    return s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": settings.AWS_BUCKET_NAME,
            "Key": storage_key,
            "ResponseContentDisposition": f'attachment; filename="{safe_filename}"',
        },
        ExpiresIn=expires_in
    )