# backend/features/dynamic_loan_pricing/routes.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from .model import LoanOptimizer, Loan

loan_pricing_bp = Blueprint('loan_pricing', __name__, url_prefix='/api/loan-pricing')

# Initialize the LoanOptimizer on startup
optimizer = LoanOptimizer()

@loan_pricing_bp.route('/calculate-emi', methods=['POST'])
def calculate_emi():
    """
    Expects a JSON payload with:
      - principal, interestRate, tenureMonths, startDate (YYYY-MM-DD), lender, loanType
    """
    data = request.get_json()
    try:
        start_date = datetime.strptime(data['startDate'], '%Y-%m-%d')
    except Exception as e:
        return jsonify({'error': 'Invalid date format; expected YYYY-MM-DD'}), 400

    try:
        loan = Loan(
            loan_id="temp",
            principal=float(data['principal']),
            interest_rate=float(data['interestRate']),
            tenure_months=int(data['tenureMonths']),
            start_date=start_date,
            lender=data['lender'],
            loan_type=data['loanType']
        )
    except Exception as e:
        return jsonify({'error': f'Invalid input values: {str(e)}'}), 400

    emi = optimizer.calculate_emi(loan.principal, loan.interest_rate, loan.tenure_months)
    stats = optimizer.get_loan_statistics()
    result = {
        'emi': emi,
        'market_statistics': stats
    }
    return jsonify(result)
