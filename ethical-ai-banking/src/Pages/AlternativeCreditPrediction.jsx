import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/LoanApplication.css"; // Reusing the same CSS as LoanApplication

const AlternativeCreditPrediction = () => {
  const [formData, setFormData] = useState({
    age: "",
    netflix_payment: "",
    spotify_payment: "",
    other_subscriptions: "",
    rent_amount: "",
    utility_bills: "",
    rent_payment_history: "",
    utility_payment_history: "",
    subscription_payment_history: "",
    avg_monthly_balance: "",
    num_overdrafts_past_year: "",
    savings_rate: "",
    monthly_income: "",
    months_current_job: "",
    num_income_sources: "",
    debt_to_income_ratio: "",
    num_late_payments_past_year: "",
    avg_transaction_amount: ""
  });

  const [prediction, setPrediction] = useState("");
  const [error, setError] = useState("");

  // Handle changes to form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit the form and call the backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/credit-scoring/predict",
        formData
      );
      setPrediction(response.data.predicted_credit_score);
      setError("");
    } catch (err) {
      console.error("Error predicting alternative credit score:", err);
      setError("Error predicting alternative credit score. Please try again.");
      setPrediction("");
    }
  };

  return (
    <div className="loan-application-page">
      <h1>Alternative Credit Score Prediction</h1>
      <form onSubmit={handleSubmit} className="loan-form">
        {Object.keys(formData).map((key, index) => (
          <div key={index} className="auth-input-group">
            <label>{key.replace(/_/g, " ")}</label>
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit" className="apply-button">
          Predict Credit Score
        </button>
      </form>

      {prediction && (
        <div className="prediction-result">
          <p>
            <strong>Predicted Credit Score:</strong> {prediction}
          </p>
        </div>
      )}
      {error && (
        <div className="prediction-result error">
          <p>{error}</p>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <Link to="/home" className="back-button">
          ⬅ Back to Home
        </Link>
      </div>
    </div>
  );
};

export default AlternativeCreditPrediction;
