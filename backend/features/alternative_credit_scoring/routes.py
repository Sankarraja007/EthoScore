# backend/features/alternative_credit_scoring/routes.py
from flask import Blueprint, request, jsonify
import pandas as pd
from .model import prepare_data, train_model, predict_credit_score

credit_scoring_bp = Blueprint('credit_scoring', __name__, url_prefix='/api/credit-scoring')

# Pre-train the alternative credit scoring model when the server starts
X_train_scaled, X_test_scaled, y_train, y_test, scaler = prepare_data()
model = train_model(X_train_scaled, y_train)

@credit_scoring_bp.route('/predict', methods=['POST'])
def predict_credit_score_route():
    """
    Expects a JSON payload with the required features.
    """
    data = request.get_json()
    features = [
        'age', 'netflix_payment', 'spotify_payment', 'other_subscriptions',
        'rent_amount', 'utility_bills', 'rent_payment_history', 'utility_payment_history',
        'subscription_payment_history', 'avg_monthly_balance', 'num_overdrafts_past_year', 'savings_rate',
        'monthly_income', 'months_current_job', 'num_income_sources', 'debt_to_income_ratio',
        'num_late_payments_past_year', 'avg_transaction_amount'
    ]
    try:
        new_data = pd.DataFrame([data], columns=features)
    except Exception as e:
        return jsonify({'error': f'Invalid input data: {str(e)}'}), 400

    prediction = predict_credit_score(model, scaler, new_data)
    return jsonify({'predicted_credit_score': float(prediction[0])})
