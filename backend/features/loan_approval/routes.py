from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
from .model import (
    load_and_preprocess_home_loan,
    load_and_preprocess_personal_loan,
    load_and_preprocess_credit_card,
    train_and_explain,
    define_protected_attributes
)

def convert_np(obj):
    """
    Recursively convert NumPy data types in an object to native Python types.
    """
    if isinstance(obj, np.generic):
        return obj.item()
    elif isinstance(obj, dict):
        return {k: convert_np(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_np(i) for i in obj]
    else:
        return obj

# Define the blueprint
loan_bp = Blueprint('loan_approval', __name__, url_prefix='/api/loan-approval')

# Load protected attribute definitions
protected_attributes = define_protected_attributes()

#############################################
# Home Loan Model
#############################################
home_protected = protected_attributes['home_loan']
home_loan_data = load_and_preprocess_home_loan()
X_home = home_loan_data.drop(['Loan_ID', 'Loan_Status'], axis=1)
y_home = home_loan_data['Loan_Status']

default_home = {
    'Gender': 1,
    'Married': 1,
    'Dependents': 2,
    'Education': 0,
    'Self_Employed': 0,
    'ApplicantIncome': 3000,
    'CoapplicantIncome': 0,
    'LoanAmount': 250,
    'Loan_Amount_Term': 360,
    'Credit_History': 1,
    'Property_Area': 2
}

home_model, home_importance, home_scaler, home_fairness = train_and_explain(
    X_home, y_home, pd.DataFrame([default_home]), home_protected
)

#############################################
# General (Personal) Loan Model
#############################################
general_protected = protected_attributes['personal_loan']
personal_loan_data = load_and_preprocess_personal_loan()
X_general = personal_loan_data.drop(['loan_id', 'loan_status'], axis=1)
y_general = personal_loan_data['loan_status']

default_general = {
    'no_of_dependents': 3,
    'education': 0,
    'self_employed': 1,
    'income_annum': 4100000,
    'loan_amount': 29000000,
    'loan_term': 20,
    'cibil_score': 400,
    'residential_assets_value': 2000000,
    'commercial_assets_value': 2000000,
    'luxury_assets_value': 8000000,
    'bank_asset_value': 3000000
}

general_model, general_importance, general_scaler, general_fairness = train_and_explain(
    X_general, y_general, pd.DataFrame([default_general]), general_protected
)

#############################################
# Credit Card Approval Model
#############################################
credit_protected = protected_attributes['credit_card']
credit_card_data = load_and_preprocess_credit_card()
X_credit = credit_card_data.drop(['ID', 'BAD_STATUS'], axis=1)
y_credit = credit_card_data['BAD_STATUS']

default_credit = {
    'CODE_GENDER': 0,
    'FLAG_OWN_CAR': 0,
    'FLAG_OWN_REALTY': 0,
    'CNT_CHILDREN': 2,
    'AMT_INCOME_TOTAL': 150000,
    'NAME_INCOME_TYPE': 0,
    'NAME_EDUCATION_TYPE': 1,
    'NAME_FAMILY_STATUS': 0,
    'NAME_HOUSING_TYPE': 0,
    'DAYS_BIRTH': -12000,
    'DAYS_EMPLOYED': -1000,
    'FLAG_MOBIL': 1,
    'FLAG_WORK_PHONE': 0,
    'FLAG_PHONE': 0,
    'FLAG_EMAIL': 0,
    'OCCUPATION_TYPE': 0,
    'CNT_FAM_MEMBERS': 3
}

credit_model, credit_importance, credit_scaler, credit_fairness = train_and_explain(
    X_credit, y_credit, pd.DataFrame([default_credit]), credit_protected
)

#############################################
# Helper function to process request data
#############################################
def process_request(data, expected_columns, scaler):
    df = pd.DataFrame([data])
    df = df[expected_columns]  # Ensure correct column order
    df = df.replace("", 0)     # Replace empty strings with 0
    df = df.apply(pd.to_numeric, errors='raise')
    scaled_data = scaler.transform(df)
    return scaled_data

#############################################
# Endpoints for Home Loan
#############################################
@loan_bp.route('/predict-home', methods=['POST'])
def predict_home_loan():
    data = request.get_json()
    try:
        scaled_data = process_request(data, X_home.columns, home_scaler)
    except Exception as e:
        return jsonify({'error': f'Invalid input data: {str(e)}'}), 400

    prediction = home_model.predict(scaled_data)
    prob = home_model.predict_proba(scaled_data)
    result = {
        'prediction': 'Approved' if prediction[0] == 1 else 'Rejected',
        'probabilities': prob.tolist(),
        'feature_importance': home_importance.to_dict(orient='records')
    }
    return jsonify(convert_np(result))

@loan_bp.route('/predict-home-fair', methods=['POST'])
def predict_home_loan_fair():
    data = request.get_json()
    try:
        scaled_data = process_request(data, X_home.columns, home_scaler)
    except Exception as e:
        return jsonify({'error': f'Invalid input data: {str(e)}'}), 400

    prediction = home_model.predict(scaled_data)
    prob = home_model.predict_proba(scaled_data)
    result = {
        'prediction': 'Approved (Fair Model)' if prediction[0] == 1 else 'Rejected (Fair Model)',
        'probabilities': prob.tolist(),
        'feature_importance': home_importance.to_dict(orient='records'),
        'fairness': home_fairness
    }
    return jsonify(convert_np(result))

#############################################
# Endpoints for General (Personal) Loan
#############################################
@loan_bp.route('/predict-general', methods=['POST'])
def predict_general_loan():
    data = request.get_json()
    try:
        scaled_data = process_request(data, X_general.columns, general_scaler)
    except Exception as e:
        return jsonify({'error': f'Invalid input data: {str(e)}'}), 400

    prediction = general_model.predict(scaled_data)
    prob = general_model.predict_proba(scaled_data)
    result = {
        'prediction': 'Approved' if prediction[0] == 1 else 'Rejected',
        'probabilities': prob.tolist(),
        'feature_importance': general_importance.to_dict(orient='records')
    }
    return jsonify(convert_np(result))

@loan_bp.route('/predict-general-fair', methods=['POST'])
def predict_general_loan_fair():
    data = request.get_json()
    try:
        scaled_data = process_request(data, X_general.columns, general_scaler)
    except Exception as e:
        return jsonify({'error': f'Invalid input data: {str(e)}'}), 400

    prediction = general_model.predict(scaled_data)
    prob = general_model.predict_proba(scaled_data)
    result = {
        'prediction': 'Approved (Fair Model)' if prediction[0] == 1 else 'Rejected (Fair Model)',
        'probabilities': prob.tolist(),
        'feature_importance': general_importance.to_dict(orient='records'),
        'fairness': general_fairness
    }
    return jsonify(convert_np(result))

#############################################
# Endpoints for Credit Card Approval
#############################################
@loan_bp.route('/predict-credit', methods=['POST'])
def predict_credit_card():
    data = request.get_json()
    try:
        scaled_data = process_request(data, X_credit.columns, credit_scaler)
    except Exception as e:
        return jsonify({'error': f'Invalid input data: {str(e)}'}), 400

    prediction = credit_model.predict(scaled_data)
    prob = credit_model.predict_proba(scaled_data)
    result = {
        'prediction': 'Approved' if prediction[0] == 1 else 'Rejected',
        'probabilities': prob.tolist(),
        'feature_importance': credit_importance.to_dict(orient='records')
    }
    return jsonify(convert_np(result))

@loan_bp.route('/predict-credit-fair', methods=['POST'])
def predict_credit_card_fair():
    data = request.get_json()
    try:
        scaled_data = process_request(data, X_credit.columns, credit_scaler)
    except Exception as e:
        return jsonify({'error': f'Invalid input data: {str(e)}'}), 400

    prediction = credit_model.predict(scaled_data)
    prob = credit_model.predict_proba(scaled_data)
    result = {
        'prediction': 'Approved (Fair Model)' if prediction[0] == 1 else 'Rejected (Fair Model)',
        'probabilities': prob.tolist(),
        'feature_importance': credit_importance.to_dict(orient='records'),
        'fairness': credit_fairness
    }
    return jsonify(convert_np(result))
