import logging
from datetime import date
from decimal import Decimal

import resend

from src.core.config import settings

from .templates import build_reminder_template

logger = logging.getLogger(__name__)

FROM_EMAIL = "Conexia <onboarding@resend.dev>"


def send_reminder_email(
    to: str,
    company_name: str,
    deadline_name: str,
    description: str,
    due_date: date,
    amount: Decimal | str | None,
) -> bool:
    try:
        resend.api_key = settings.RESEND_API_KEY
        html_content = build_reminder_template(
            company_name=company_name,
            deadline_name=deadline_name,
            description=description,
            due_date=due_date,
            amount=amount,
        )

        resend.Emails.send(
            {
                "from": FROM_EMAIL,
                "to": [to],
                "subject": f"Recordatorio de vencimiento - {company_name}",
                "html": html_content,
            }
        )
        logger.info("Reminder email sent to %s", to)
        return True
    except Exception:
        logger.exception("Failed to send reminder email to %s", to)
        return False