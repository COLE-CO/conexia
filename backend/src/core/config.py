from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, env_file_encoding="utf-8")

    PROJECT_NAME: str = "Conexia"

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Seed admin
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str

    # OpenAI
    OPENAI_API_KEY: str 

    # S3
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_SESSION_TOKEN: str | None = None
    AWS_REGION: str
    AWS_BUCKET_NAME: str

    # Email
    RESEND_API_KEY: str


settings = Settings()