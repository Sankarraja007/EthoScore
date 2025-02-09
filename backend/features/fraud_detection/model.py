# backend/features/fraud_detection/model.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
import warnings
from datetime import datetime, timedelta
import random

warnings.filterwarnings('ignore')

class CreditCardFraudDetector:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )

    def preprocess_data(self, X, y):
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        X_train[['Amount', 'Time']] = self.scaler.fit_transform(X_train[['Amount', 'Time']])
        X_test[['Amount', 'Time']] = self.scaler.transform(X_test[['Amount', 'Time']])
        return X_train, X_test, y_train, y_test

    def train_and_evaluate(self, X_train, X_test, y_train, y_test):
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        print("\nModel Performance:")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        print("\nROC AUC Score:", roc_auc_score(y_test, y_pred_proba))

    def predict_transactions(self, transactions):
        X = transactions.copy()
        if 'Amount' in X.columns and 'Time' in X.columns:
            X[['Amount', 'Time']] = self.scaler.transform(X[['Amount', 'Time']])
        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)[:, 1]
        return predictions, probabilities

class TransactionGenerator:
    def __init__(self, start_date='2024-01-01', num_days=14):
        self.start_date = datetime.strptime(start_date, '%Y-%m-%d')
        self.num_days = num_days
        self.merchants = {
            'grocery': ['Walmart', 'Whole Foods', 'Trader Joes', 'Safeway'],
            'restaurant': ['McDonalds', 'Starbucks', 'Chipotle', 'Local Diner'],
            'shopping': ['Amazon', 'Target', 'Best Buy', 'Nike'],
            'utilities': ['Electric Co.', 'Water Corp', 'Internet Service', 'Phone Bill'],
            'entertainment': ['Netflix', 'Cinema', 'Steam Games', 'Spotify']
        }

    def generate_normal_transaction(self, date):
        category = random.choice(list(self.merchants.keys()))
        merchant = random.choice(self.merchants[category])
        amount_ranges = {
            'grocery': (30, 200),
            'restaurant': (10, 100),
            'shopping': (20, 500),
            'utilities': (50, 250),
            'entertainment': (10, 75)
        }
        hour = random.randint(7, 23)
        minute = random.randint(0, 59)
        time = hour * 3600 + minute * 60
        amount = random.uniform(*amount_ranges[category])
        v_features = [random.uniform(-1, 1) for _ in range(28)]
        return {
            'Time': time,
            'Amount': amount,
            'Date': date,
            'Merchant': merchant,
            'Category': category,
            'Class': 0,
            **{f'V{i+1}': v for i, v in enumerate(v_features)}
        }

    def generate_fraud_transaction(self, date):
        fraud_patterns = [
            {'merchant': 'Unknown Online Store', 'amount_range': (1000, 5000), 'hour_range': (0, 5)},
            {'merchant': 'Foreign ATM', 'amount_range': (800, 2500), 'hour_range': (1, 4)},
            {'merchant': 'Suspicious Marketplace', 'amount_range': (1500, 4000), 'hour_range': (0, 3)}
        ]
        pattern = random.choice(fraud_patterns)
        hour = random.randint(*pattern['hour_range'])
        minute = random.randint(0, 59)
        time = hour * 3600 + minute * 60
        amount = random.uniform(*pattern['amount_range'])
        v_features = [random.uniform(-3, 3) for _ in range(28)]
        for i in random.sample(range(28), 8):
            v_features[i] *= 2
        return {
            'Time': time,
            'Amount': amount,
            'Date': date,
            'Merchant': pattern['merchant'],
            'Category': 'suspicious',
            'Class': 1,
            **{f'V{i+1}': v for i, v in enumerate(v_features)}
        }

    def generate_dataset(self, min_transactions=100, fraud_rate=0.2):
        transactions = []
        current_date = self.start_date
        min_frauds = max(5, int(min_transactions * fraud_rate))
        for _ in range(self.num_days):
            num_daily = random.randint(5, 10)
            for _ in range(num_daily):
                transactions.append(self.generate_normal_transaction(current_date))
            current_date += timedelta(days=1)
        for _ in range(min_frauds):
            fraud_date = self.start_date + timedelta(days=random.randint(0, self.num_days - 1))
            transactions.append(self.generate_fraud_transaction(fraud_date))
        df = pd.DataFrame(transactions)
        df['DateTime'] = pd.to_datetime(df['Date']) + pd.to_timedelta(df['Time'], unit='s')
        df = df.sort_values('DateTime').reset_index(drop=True)
        return df
