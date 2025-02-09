# backend/features/alternative_credit_scoring/model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import datetime

def generate_synthetic_data(n_samples=1000):
    np.random.seed(42)
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=730)
    dates = pd.date_range(start=start_date, end=end_date, periods=n_samples)
    data = {
        'customer_id': range(1, n_samples + 1),
        'age': np.random.randint(18, 75, n_samples),
        'netflix_payment': np.random.choice([0, 15.99], n_samples),
        'spotify_payment': np.random.choice([0, 9.99], n_samples),
        'other_subscriptions': np.random.uniform(0, 50, n_samples),
        'rent_amount': np.random.uniform(500, 3000, n_samples),
        'utility_bills': np.random.uniform(50, 300, n_samples),
        'rent_payment_history': np.random.uniform(0.7, 1.0, n_samples),
        'utility_payment_history': np.random.uniform(0.7, 1.0, n_samples),
        'subscription_payment_history': np.random.uniform(0.7, 1.0, n_samples),
        'avg_monthly_balance': np.random.uniform(500, 10000, n_samples),
        'num_overdrafts_past_year': np.random.randint(0, 5, n_samples),
        'savings_rate': np.random.uniform(0, 0.3, n_samples),
        'monthly_income': np.random.uniform(2000, 12000, n_samples),
        'months_current_job': np.random.randint(0, 120, n_samples),
        'num_income_sources': np.random.randint(1, 4, n_samples),
        'debt_to_income_ratio': np.random.uniform(0, 0.5, n_samples),
        'num_late_payments_past_year': np.random.randint(0, 10, n_samples),
        'avg_transaction_amount': np.random.uniform(20, 500, n_samples)
    }

    credit_scores = []
    for i in range(n_samples):
        base_score = 650
        payment_history_score = (
            data['rent_payment_history'][i] * 100 +
            data['utility_payment_history'][i] * 50 +
            data['subscription_payment_history'][i] * 30
        )
        income_stability_score = (
            min(data['months_current_job'][i] / 24, 1) * 40 +
            (data['num_income_sources'][i] - 1) * 10
        )
        banking_score = (
            min(data['avg_monthly_balance'][i] / 5000, 1) * 30 -
            data['num_overdrafts_past_year'][i] * 10 +
            data['savings_rate'][i] * 50
        )
        negative_factors = (
            data['debt_to_income_ratio'][i] * -100 +
            data['num_late_payments_past_year'][i] * -10
        )
        score = base_score + payment_history_score + income_stability_score + banking_score + negative_factors
        score = max(300, min(900, score))
        credit_scores.append(score)
    data['credit_score'] = credit_scores
    return pd.DataFrame(data)

def prepare_data():
    df = generate_synthetic_data(1000)
    features = [
        'age', 'netflix_payment', 'spotify_payment', 'other_subscriptions',
        'rent_amount', 'utility_bills', 'rent_payment_history',
        'utility_payment_history', 'subscription_payment_history',
        'avg_monthly_balance', 'num_overdrafts_past_year', 'savings_rate',
        'monthly_income', 'months_current_job', 'num_income_sources',
        'debt_to_income_ratio', 'num_late_payments_past_year', 'avg_transaction_amount'
    ]
    X = df[features]
    y = df['credit_score']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler

def train_model(X_train, y_train):
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )
    model.fit(X_train, y_train)
    return model

def predict_credit_score(model, scaler, new_data):
    new_data_scaled = scaler.transform(new_data)
    prediction = model.predict(new_data_scaled)
    return prediction
