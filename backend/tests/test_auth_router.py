import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from fastapi import HTTPException

from src.modules.auth import router, schemas


class UpdateMyProfileTests(unittest.TestCase):
    def test_update_my_profile_rejects_email_change(self):
        db = MagicMock()
        current_user = SimpleNamespace(email="qa@conexia.com", id=7)
        profile_data = schemas.UserProfileUpdate(
            full_name="QA Analyst",
            email="otro@conexia.com",
            alert_deadlines_enabled=True,
            alert_balances_enabled=True,
            alert_reports_enabled=False,
        )

        with self.assertRaises(HTTPException) as error:
            router.update_my_profile(profile_data, db, current_user)

        self.assertEqual(error.exception.status_code, 400)
        self.assertEqual(
            error.exception.detail, "Email cannot be changed from profile settings"
        )

    @patch("src.modules.auth.router.service.update_user_profile")
    @patch("src.modules.auth.router.service.get_user_by_email")
    def test_update_my_profile_updates_current_user_when_payload_is_valid(
        self, get_user_by_email_mock, update_user_profile_mock
    ):
        db = MagicMock()
        current_user = SimpleNamespace(email="qa@conexia.com", id=7)
        profile_data = schemas.UserProfileUpdate(
            full_name="QA Lead",
            email="qa@conexia.com",
            alert_deadlines_enabled=False,
            alert_balances_enabled=True,
            alert_reports_enabled=True,
        )
        updated_user = SimpleNamespace(
            email="qa@conexia.com",
            full_name="QA Lead",
            id=7,
        )
        get_user_by_email_mock.return_value = current_user
        update_user_profile_mock.return_value = updated_user

        result = router.update_my_profile(profile_data, db, current_user)

        self.assertIs(result, updated_user)
        get_user_by_email_mock.assert_called_once_with(db, email="qa@conexia.com")
        update_user_profile_mock.assert_called_once_with(db, current_user, profile_data)


if __name__ == "__main__":
    unittest.main()
