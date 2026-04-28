import unittest

from src.modules.auth import models as auth_models
from src.modules.cole_co.cash_flow import router


class CashFlowRouterRoleTests(unittest.TestCase):
    def test_cash_flow_allows_admin_and_cole_co_accountant(self):
        self.assertEqual(
            router.ALLOWED_ROLES,
            [
                auth_models.UserRole.ADMIN,
                auth_models.UserRole.CONTADOR_COLE_CO,
            ],
        )


if __name__ == "__main__":
    unittest.main()
