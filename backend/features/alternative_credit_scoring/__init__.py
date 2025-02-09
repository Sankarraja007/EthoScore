# backend/features/alternative_credit_scoring/__init__.py
from .model import generate_synthetic_data, prepare_data, train_model, predict_credit_score
from .explainability import explain_prediction
