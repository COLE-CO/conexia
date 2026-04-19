import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from src.core.database import SessionLocal
from src.modules.family_office.deadlines.service import send_pending_reminders

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def run_pending_reminders_job() -> None:
    db = SessionLocal()
    try:
        sent_count = send_pending_reminders(db)
        logger.info("Scheduled reminder job finished: %s reminders sent", sent_count)
    except Exception:
        logger.exception("Scheduled reminder job failed")
    finally:
        db.close()


def start_scheduler() -> None:
    if scheduler.running:
        return

    scheduler.add_job(
        run_pending_reminders_job,
        trigger="cron",
        hour=8,
        minute=0,
        id="pending_deadline_reminders",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("APScheduler started for deadline reminders at 08:00")


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped")