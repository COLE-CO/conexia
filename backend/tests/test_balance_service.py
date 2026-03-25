import unittest
from unittest.mock import MagicMock, patch

from src.modules.family_office.balances import models, service


class GetBalancesByCompanyTests(unittest.TestCase):
    def setUp(self):
        self.db = MagicMock()
        self.query = MagicMock()
        self.filtered_query = MagicMock()
        self.ordered_query = MagicMock()

        self.db.query.return_value = self.query
        self.query.filter.return_value = self.filtered_query
        self.filtered_query.filter.return_value = self.filtered_query
        self.filtered_query.order_by.return_value = self.ordered_query
        self.ordered_query.all.return_value = ["balance-1", "balance-2"]

    def test_returns_balances_ordered_by_most_recent_upload(self):
        result = service.get_balances_by_company(self.db, company_id=10)

        self.db.query.assert_called_once_with(models.Balance)
        self.query.filter.assert_called_once()
        self.filtered_query.order_by.assert_called_once()
        self.ordered_query.all.assert_called_once_with()
        self.assertEqual(result, ["balance-1", "balance-2"])

    def test_applies_year_and_month_filters_when_provided(self):
        service.get_balances_by_company(self.db, company_id=10, year=2024, month=3)

        self.assertEqual(self.filtered_query.filter.call_count, 2)
        self.filtered_query.order_by.assert_called_once()

    @patch("src.modules.family_office.balances.service.extract")
    def test_applies_day_filter_when_provided(self, extract_mock):
        extract_result = MagicMock()
        extract_mock.return_value = extract_result

        service.get_balances_by_company(self.db, company_id=10, day=15)

        extract_mock.assert_called_once_with("day", models.Balance.uploaded_at)
        self.filtered_query.filter.assert_called_once()
        self.filtered_query.order_by.assert_called_once()

    def test_applies_search_filter_when_provided(self):
        service.get_balances_by_company(
            self.db, company_id=10, search="balance_general_2024"
        )

        self.filtered_query.filter.assert_called_once()
        filter_expression = self.filtered_query.filter.call_args.args[0]
        self.assertEqual(filter_expression.right.value, "%balance_general_2024%")
        self.filtered_query.order_by.assert_called_once()


if __name__ == "__main__":
    unittest.main()
