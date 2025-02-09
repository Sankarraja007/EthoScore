# backend/tests/test_features.py

import unittest
import pandas as pd
from features.alternative_credit_scoring.model import generate_synthetic_data, prepare_data, train_model, predict_credit_score

class TestAlternativeCreditScoring(unittest.TestCase):
    def test_generate_synthetic_data(self):
        df = generate_synthetic_data(100)
        self.assertEqual(len(df), 100)
        self.assertIn('credit_score', df.columns)

    def test_prepare_data(self):
        X_train, X_test, y_train, y_test, scaler = prepare_data()
        self.assertIsNotNone(X_train)
        self.assertIsNotNone(scaler)

    def test_predict_credit_score(self):
        X_train, X_test, y_train, y_test, scaler = prepare_data()
        model = train_model(X_train, y_train)
        features = [
            'age', 'netflix_payment', 'spotify_payment', 'other_subscriptions',
            'rent_amount', 'utility_bills', 'rent_payment_history',
            'utility_payment_history', 'subscription_payment_history',
            'avg_monthly_balance', 'num_overdrafts_past_year', 'savings_rate',
            'monthly_income', 'months_current_job', 'num_income_sources',
            'debt_to_income_ratio', 'num_late_payments_past_year', 'avg_transaction_amount'
        ]
        sample_data = pd.DataFrame([{feature: 1 for feature in features}])
        prediction = predict_credit_score(model, scaler, sample_data)
        self.assertTrue(len(prediction) == 1)

if __name__ == '__main__':
    unittest.main()
