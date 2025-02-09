# backend/features/dynamic_loan_pricing/model.py

import pandas as pd
import numpy as np
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime, timedelta

@dataclass
class Loan:
    loan_id: str
    principal: float
    interest_rate: float
    tenure_months: int
    start_date: datetime
    lender: str
    loan_type: str

class LoanOptimizer:
    def __init__(self):
        self.market_loans = [
            # Home Loans
            {"lender": "ABC Bank", "loan_type": "Home", "min_amount": 500000, "max_amount": 10000000, "interest_rate": 8.50, "max_tenure": 360},
            {"lender": "XYZ Bank", "loan_type": "Home", "min_amount": 300000, "max_amount": 7500000, "interest_rate": 8.75, "max_tenure": 300},
            {"lender": "City Bank", "loan_type": "Home", "min_amount": 1000000, "max_amount": 15000000, "interest_rate": 8.25, "max_tenure": 360},
            {"lender": "Rural Bank", "loan_type": "Home", "min_amount": 200000, "max_amount": 5000000, "interest_rate": 9.00, "max_tenure": 240},
            {"lender": "Metro Finance", "loan_type": "Home", "min_amount": 750000, "max_amount": 12000000, "interest_rate": 8.40, "max_tenure": 360},
            {"lender": "Housing Corp", "loan_type": "Home", "min_amount": 1500000, "max_amount": 20000000, "interest_rate": 8.15, "max_tenure": 360},
            {"lender": "Prime Housing", "loan_type": "Home", "min_amount": 2000000, "max_amount": 25000000, "interest_rate": 8.30, "max_tenure": 300},
            {"lender": "Urban Homes", "loan_type": "Home", "min_amount": 1000000, "max_amount": 18000000, "interest_rate": 8.60, "max_tenure": 360},
            {"lender": "State Bank", "loan_type": "Home", "min_amount": 500000, "max_amount": 15000000, "interest_rate": 8.45, "max_tenure": 360},
            {"lender": "Cooperative Bank", "loan_type": "Home", "min_amount": 300000, "max_amount": 8000000, "interest_rate": 8.90, "max_tenure": 240},
            # Personal Loans
            {"lender": "ABC Bank", "loan_type": "Personal", "min_amount": 50000, "max_amount": 1000000, "interest_rate": 12.50, "max_tenure": 60},
            {"lender": "XYZ Bank", "loan_type": "Personal", "min_amount": 100000, "max_amount": 1500000, "interest_rate": 11.75, "max_tenure": 72},
            {"lender": "City Bank", "loan_type": "Personal", "min_amount": 75000, "max_amount": 2000000, "interest_rate": 12.00, "max_tenure": 84},
            {"lender": "Quick Cash", "loan_type": "Personal", "min_amount": 25000, "max_amount": 500000, "interest_rate": 14.00, "max_tenure": 48},
            {"lender": "Easy Loan", "loan_type": "Personal", "min_amount": 30000, "max_amount": 800000, "interest_rate": 13.50, "max_tenure": 60},
            {"lender": "Metro Finance", "loan_type": "Personal", "min_amount": 100000, "max_amount": 2500000, "interest_rate": 11.90, "max_tenure": 72},
            {"lender": "Prime Lending", "loan_type": "Personal", "min_amount": 200000, "max_amount": 3000000, "interest_rate": 11.50, "max_tenure": 84},
            {"lender": "Urban Finance", "loan_type": "Personal", "min_amount": 50000, "max_amount": 1200000, "interest_rate": 12.75, "max_tenure": 60},
            {"lender": "State Bank", "loan_type": "Personal", "min_amount": 100000, "max_amount": 2000000, "interest_rate": 12.25, "max_tenure": 72},
            {"lender": "Digital Loans", "loan_type": "Personal", "min_amount": 25000, "max_amount": 600000, "interest_rate": 13.75, "max_tenure": 48},
            # Car Loans
            {"lender": "ABC Bank", "loan_type": "Car", "min_amount": 100000, "max_amount": 3000000, "interest_rate": 9.50, "max_tenure": 84},
            {"lender": "XYZ Bank", "loan_type": "Car", "min_amount": 200000, "max_amount": 2500000, "interest_rate": 9.75, "max_tenure": 72},
            {"lender": "City Bank", "loan_type": "Car", "min_amount": 150000, "max_amount": 2000000, "interest_rate": 9.25, "max_tenure": 60},
            {"lender": "Auto Finance", "loan_type": "Car", "min_amount": 300000, "max_amount": 4000000, "interest_rate": 9.00, "max_tenure": 84},
            {"lender": "Wheel Loans", "loan_type": "Car", "min_amount": 250000, "max_amount": 3500000, "interest_rate": 9.40, "max_tenure": 72},
            {"lender": "Metro Finance", "loan_type": "Car", "min_amount": 200000, "max_amount": 3000000, "interest_rate": 9.60, "max_tenure": 84},
            {"lender": "Prime Motors", "loan_type": "Car", "min_amount": 500000, "max_amount": 5000000, "interest_rate": 9.15, "max_tenure": 84},
            {"lender": "Urban Wheels", "loan_type": "Car", "min_amount": 300000, "max_amount": 4000000, "interest_rate": 9.35, "max_tenure": 72},
            {"lender": "State Bank", "loan_type": "Car", "min_amount": 200000, "max_amount": 3000000, "interest_rate": 9.45, "max_tenure": 84},
            {"lender": "Drive Finance", "loan_type": "Car", "min_amount": 150000, "max_amount": 2500000, "interest_rate": 9.80, "max_tenure": 60}
        ]
        self.sample_loans = [
            Loan("HL001", 2500000, 9.50, 240, datetime(2022, 1, 1), "Old Bank", "Home"),
            Loan("HL002", 3500000, 9.75, 300, datetime(2021, 3, 1), "Home Finance", "Home"),
            Loan("HL003", 1500000, 8.90, 180, datetime(2022, 7, 1), "Prime Bank", "Home"),
            Loan("HL004", 4500000, 8.75, 360, datetime(2020, 12, 1), "Metro Bank", "Home"),
            Loan("HL005", 6000000, 8.60, 300, datetime(2023, 5, 1), "City Housing", "Home"),
            Loan("HL006", 3200000, 9.25, 240, datetime(2021, 8, 15), "Urban Homes", "Home"),
            Loan("HL007", 4800000, 8.80, 360, datetime(2022, 3, 10), "State Bank", "Home"),
            Loan("HL008", 2800000, 9.15, 300, datetime(2023, 1, 20), "Housing Corp", "Home"),
            Loan("HL009", 5500000, 8.95, 360, datetime(2021, 11, 5), "Prime Housing", "Home"),
            Loan("HL010", 3800000, 9.10, 240, datetime(2022, 9, 25), "Metro Finance", "Home"),
            Loan("PL001", 500000, 13.50, 48, datetime(2023, 6, 1), "Quick Finance", "Personal"),
            Loan("PL002", 300000, 14.00, 36, datetime(2023, 9, 1), "Easy Loan", "Personal"),
            Loan("PL003", 250000, 13.25, 24, datetime(2024, 1, 1), "Quick Cash", "Personal"),
            Loan("PL004", 750000, 12.75, 60, datetime(2023, 4, 15), "Urban Finance", "Personal"),
            Loan("PL005", 400000, 13.80, 48, datetime(2023, 7, 20), "Metro Finance", "Personal"),
            Loan("PL006", 600000, 12.90, 36, datetime(2023, 11, 10), "Prime Lending", "Personal"),
            Loan("PL007", 350000, 13.60, 24, datetime(2024, 2, 5), "Digital Loans", "Personal"),
            Loan("PL008", 900000, 12.40, 60, datetime(2023, 3, 25), "State Bank", "Personal"),
            Loan("PL009", 450000, 13.90, 48, datetime(2023, 8, 15), "City Bank", "Personal"),
            Loan("PL010", 550000, 13.20, 36, datetime(2023, 12, 20), "ABC Bank", "Personal"),
            Loan("CL001", 800000, 10.50, 60, datetime(2023, 1, 1), "Auto Finance", "Car"),
            Loan("CL002", 600000, 10.25, 48, datetime(2023, 4, 1), "Car City", "Car"),
            Loan("CL003", 900000, 9.90, 72, datetime(2023, 8, 1), "Wheel Finance", "Car"),
            Loan("CL004", 1200000, 9.75, 60, datetime(2023, 3, 15), "Prime Motors", "Car"),
            Loan("CL005", 750000, 10.15, 48, datetime(2023, 6, 20), "Urban Wheels", "Car"),
            Loan("CL006", 1000000, 9.85, 72, datetime(2023, 2, 10), "Drive Finance", "Car"),
            Loan("CL007", 850000, 10.10, 60, datetime(2023, 5, 5), "Metro Finance", "Car"),
            Loan("CL008", 1500000, 9.60, 84, datetime(2023, 1, 25), "State Bank", "Car"),
            Loan("CL009", 700000, 10.30, 48, datetime(2023, 7, 15), "City Bank", "Car"),
            Loan("CL010", 950000, 9.95, 72, datetime(2023, 4, 20), "ABC Bank", "Car")
        ]

    def calculate_emi(self, principal: float, rate: float, tenure: int) -> float:
        monthly_rate = rate / (12 * 100)
        emi = principal * monthly_rate * (1 + monthly_rate)**tenure / ((1 + monthly_rate)**tenure - 1)
        return round(emi, 2)

    def get_refinance_options(self, loan: Loan) -> List[Dict]:
        remaining_months = loan.tenure_months - ((datetime.now() - loan.start_date).days // 30)
        remaining_principal = self._calculate_remaining_principal(loan)
        better_options = []
        for market_loan in self.market_loans:
            if (market_loan['loan_type'] == loan.loan_type and
                market_loan['min_amount'] <= remaining_principal <= market_loan['max_amount'] and
                market_loan['interest_rate'] < loan.interest_rate):
                current_emi = self.calculate_emi(remaining_principal, loan.interest_rate, remaining_months)
                new_emi = self.calculate_emi(remaining_principal, market_loan['interest_rate'], remaining_months)
                savings = (current_emi - new_emi) * remaining_months
                better_options.append({
                    'lender': market_loan['lender'],
                    'interest_rate': market_loan['interest_rate'],
                    'monthly_savings': round(current_emi - new_emi, 2),
                    'total_savings': round(savings, 2),
                    'new_emi': round(new_emi, 2)
                })
        return sorted(better_options, key=lambda x: x['total_savings'], reverse=True)

    def simulate_repayment_strategies(self, loan: Loan, extra_payment: float = 0, frequency: str = 'monthly') -> Dict:
        base_emi = self.calculate_emi(loan.principal, loan.interest_rate, loan.tenure_months)
        standard_total = base_emi * loan.tenure_months
        if frequency == 'monthly':
            payments_per_year = 12
        elif frequency == 'quarterly':
            payments_per_year = 4
        else:
            payments_per_year = 1
        remaining_principal = loan.principal
        total_payments = 0
        months_to_closure = 0
        while remaining_principal > 0 and months_to_closure < loan.tenure_months:
            months_to_closure += 1
            monthly_interest = (remaining_principal * loan.interest_rate) / (12 * 100)
            principal_payment = base_emi - monthly_interest
            remaining_principal -= principal_payment
            total_payments += base_emi
            if months_to_closure % (12 // payments_per_year) == 0:
                remaining_principal -= extra_payment
                total_payments += extra_payment
            if remaining_principal <= 0:
                break
        return {
            'standard_emi': round(base_emi, 2),
            'standard_total_payment': round(standard_total, 2),
            'with_extra_payment': {
                'total_payment': round(total_payments, 2),
                'months_saved': loan.tenure_months - months_to_closure,
                'total_savings': round(standard_total - total_payments, 2)
            }
        }

    def _calculate_remaining_principal(self, loan: Loan) -> float:
        months_passed = (datetime.now() - loan.start_date).days // 30
        emi = self.calculate_emi(loan.principal, loan.interest_rate, loan.tenure_months)
        remaining_principal = loan.principal
        for _ in range(months_passed):
            interest = (remaining_principal * loan.interest_rate) / (12 * 100)
            principal_payment = emi - interest
            remaining_principal -= principal_payment
        return max(0, remaining_principal)

    def get_loan_statistics(self) -> Dict:
        stats = {loan_type: {} for loan_type in ['Home', 'Personal', 'Car']}
        for loan_type in stats:
            relevant_loans = [loan for loan in self.market_loans if loan['loan_type'] == loan_type]
            rates = [loan['interest_rate'] for loan in relevant_loans]
            stats[loan_type] = {
                'avg_rate': round(sum(rates) / len(rates), 2),
                'min_rate': min(rates),
                'max_rate': max(rates),
                'lender_count': len(relevant_loans),
                'max_amount': max(loan['max_amount'] for loan in relevant_loans),
                'min_amount': min(loan['min_amount'] for loan in relevant_loans)
            }
        return stats
