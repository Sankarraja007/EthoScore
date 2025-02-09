# backend/features/fraud_detection/routes.py
from flask import Blueprint, request, jsonify
import pandas as pd
from .model import CreditCardFraudDetector, TransactionGenerator
from .explainability import analyze_fraudulent_transactions

fraud_bp = Blueprint('fraud_detection', __name__, url_prefix='/api/fraud')

detector = CreditCardFraudDetector()
generator = TransactionGenerator(num_days=14)
transactions = generator.generate_dataset(min_transactions=200)

X = transactions.drop(['Class', 'Date', 'Merchant', 'DateTime', 'Category'], axis=1)
y = transactions['Class']
X_train, X_test, y_train, y_test = detector.preprocess_data(X, y)
detector.train_and_evaluate(X_train, X_test, y_train, y_test)

@fraud_bp.route('/transactions', methods=['GET'])
def get_transactions():
    return jsonify(transactions.to_dict(orient='records'))

@fraud_bp.route('/analyze', methods=['POST'])
def analyze_fraud():
    data = request.get_json()
    tx_data = data.get('transactions')
    if not tx_data:
        return jsonify({'error': 'No transactions provided'}), 400

    df = pd.DataFrame(tx_data)
    predictions, probabilities = detector.predict_transactions(df)
    fraud_df = analyze_fraudulent_transactions(df, predictions, probabilities)
    return jsonify(fraud_df.to_dict(orient='records'))
