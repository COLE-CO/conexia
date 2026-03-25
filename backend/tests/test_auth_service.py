import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock

from src.modules.auth import schemas, service


class UpdateUserProfileTests(unittest.TestCase):
    def test_update_user_profile_updates_fields_and_persists(self):
        db = MagicMock()
        user = SimpleNamespace(
            email="qa@conexia.com",
            full_name="QA Analyst",
            alert_deadlines_enabled=True,
            alert_balances_enabled=True,
            alert_reports_enabled=False,
        )
        profile_data = schemas.UserProfileUpdate(
            full_name="QA Lead",
            email="qa@conexia.com",
            alert_deadlines_enabled=False,
            alert_balances_enabled=True,
            alert_reports_enabled=True,
        )

        result = service.update_user_profile(db, user, profile_data)

        self.assertIs(result, user)
        self.assertEqual(user.full_name, "QA Lead")
        self.assertEqual(user.email, "qa@conexia.com")
        self.assertFalse(user.alert_deadlines_enabled)
        self.assertTrue(user.alert_balances_enabled)
        self.assertTrue(user.alert_reports_enabled)
        db.commit.assert_called_once_with()
        db.refresh.assert_called_once_with(user)


if __name__ == "__main__":
    unittest.main()
