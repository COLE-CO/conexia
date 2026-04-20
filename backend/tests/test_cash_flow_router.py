import unittest

from src.modules.auth import models as auth_models
from src.modules.cole_co.cash_flow import router


class CashFlowRouterRoleTests(unittest.TestCase):
    def test_cash_flow_is_restricted_to_admin_role(self):
        self.assertEqual(router.ALLOWED_ROLES, [auth_models.UserRole.ADMIN])


if __name__ == "__main__":
    unittest.main()
