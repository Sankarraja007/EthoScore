# backend/features/fraud_detection/explainability.py

import pandas as pd

def analyze_fraudulent_transactions(transactions, predictions, probabilities):
    transactions['Predicted_Fraud'] = predictions
    transactions['Fraud_Probability'] = probabilities
    fraud_transactions = transactions[transactions['Predicted_Fraud'] == 1].copy()
    fraud_transactions['Risk_Level'] = pd.cut(
        fraud_transactions['Fraud_Probability'],
        bins=[0, 0.7, 0.9, 1],
        labels=['Medium', 'High', 'Very High']
    )
    return fraud_transactions.sort_values('Fraud_Probability', ascending=False)
