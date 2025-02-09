import React, { useState, useEffect } from "react";
import "../styles/LoanApplication.css"; 
import { Link } from "react-router-dom";
import axios from "axios";
import { auth, addLoanApplication } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define form field configurations for each loan type
const formFields = {
  home: [
    { name: 'Gender', label: 'Gender', type: 'number' },
    { name: 'Married', label: 'Married', type: 'number' },
    { name: 'Dependents', label: 'Dependents', type: 'number' },
    { name: 'Education', label: 'Education', type: 'number' },
    { name: 'Self_Employed', label: 'Self Employed', type: 'number' },
    { name: 'ApplicantIncome', label: 'Applicant Income', type: 'number' },
    { name: 'CoapplicantIncome', label: 'Coapplicant Income', type: 'number' },
    { name: 'LoanAmount', label: 'Loan Amount', type: 'number' },
    { name: 'Loan_Amount_Term', label: 'Loan Amount Term', type: 'number' },
    { name: 'Credit_History', label: 'Credit History', type: 'number' },
    { name: 'Property_Area', label: 'Property Area', type: 'number' }
  ],
  general: [
    { name: 'no_of_dependents', label: 'Number of Dependents', type: 'number' },
    { name: 'education', label: 'Education', type: 'number' },
    { name: 'self_employed', label: 'Self Employed', type: 'number' },
    { name: 'income_annum', label: 'Annual Income', type: 'number' },
    { name: 'loan_amount', label: 'Loan Amount', type: 'number' },
    { name: 'loan_term', label: 'Loan Term', type: 'number' },
    { name: 'cibil_score', label: 'CIBIL Score', type: 'number' },
    { name: 'residential_assets_value', label: 'Residential Assets Value', type: 'number' },
    { name: 'commercial_assets_value', label: 'Commercial Assets Value', type: 'number' },
    { name: 'luxury_assets_value', label: 'Luxury Assets Value', type: 'number' },
    { name: 'bank_asset_value', label: 'Bank Asset Value', type: 'number' }
  ],
  credit: [
    { name: 'CODE_GENDER', label: 'Code Gender', type: 'number' },
    { name: 'FLAG_OWN_CAR', label: 'Own Car Flag', type: 'number' },
    { name: 'FLAG_OWN_REALTY', label: 'Own Realty Flag', type: 'number' },
    { name: 'CNT_CHILDREN', label: 'Number of Children', type: 'number' },
    { name: 'AMT_INCOME_TOTAL', label: 'Total Income', type: 'number' },
    { name: 'NAME_INCOME_TYPE', label: 'Income Type', type: 'number' },
    { name: 'NAME_EDUCATION_TYPE', label: 'Education Type', type: 'number' },
    { name: 'NAME_FAMILY_STATUS', label: 'Family Status', type: 'number' },
    { name: 'NAME_HOUSING_TYPE', label: 'Housing Type', type: 'number' },
    { name: 'DAYS_BIRTH', label: 'Days from Birth', type: 'number' },
    { name: 'DAYS_EMPLOYED', label: 'Days Employed', type: 'number' },
    { name: 'FLAG_MOBIL', label: 'Mobile Flag', type: 'number' },
    { name: 'FLAG_WORK_PHONE', label: 'Work Phone Flag', type: 'number' },
    { name: 'FLAG_PHONE', label: 'Phone Flag', type: 'number' },
    { name: 'FLAG_EMAIL', label: 'Email Flag', type: 'number' },
    { name: 'OCCUPATION_TYPE', label: 'Occupation Type', type: 'number' },
    { name: 'CNT_FAM_MEMBERS', label: 'Family Members', type: 'number' }
  ]
};

const LoanApplication = () => {
  const [loanType, setLoanType] = useState("home");
  const [formData, setFormData] = useState({});
  const [userId, setUserId] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [explanation, setExplanation] = useState("");
  const [fairness, setFairness] = useState(null);
  const [isFairMode, setIsFairMode] = useState(false);

  // When loanType changes, reset formData with only the required fields
  useEffect(() => {
    const fields = formFields[loanType] || [];
    const initial = {};
    fields.forEach(field => {
      initial[field.name] = "";
    });
    setFormData(initial);
  }, [loanType]);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Convert numeric inputs to numbers, but preserve empty strings to allow user edits.
    const newValue = type === "number" && value !== "" ? parseFloat(value) : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };
  

  // Submit application (store in Firebase)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      console.error("User not logged in");
      return;
    }
    try {
      await addLoanApplication(userId, formData);
      console.log("Loan application submitted successfully");
    } catch (error) {
      console.error("Error submitting loan application:", error);
    }
  };

  // Toggle between Standard and Fair Model modes
  const toggleFairMode = () => {
    setIsFairMode((prevMode) => !prevMode);
  };

  // Predict loan outcome by calling the backend API
  const predictLoanOutcome = async () => {
    try {
      let endpoint;
      if (loanType === "home") {
        endpoint = isFairMode ? "http://localhost:5000/api/loan-approval/predict-home-fair" : "http://localhost:5000/api/loan-approval/predict-home";
      } else if (loanType === "general") {
        endpoint = isFairMode ? "http://localhost:5000/api/loan-approval/predict-general-fair" : "http://localhost:5000/api/loan-approval/predict-general";
      } else if (loanType === "credit") {
        endpoint = isFairMode ? "http://localhost:5000/api/loan-approval/predict-credit-fair" : "http://localhost:5000/api/loan-approval/predict-credit";
      }

      const response = await axios.post(endpoint, formData);

      setPrediction(response.data.prediction);
      setExplanation(response.data.explanation || "");
      if (isFairMode && response.data.fairness) {
        setFairness(response.data.fairness);
      } else {
        setFairness(null);
      }
    } catch (error) {
      console.error("Error predicting loan outcome:", error);
      setExplanation("Error predicting loan outcome. Please try again.");
      setFairness(null);
    }
  };

  return (
    <div className={`loan-application-page ${isFairMode ? "bias-mode" : ""}`}>
      <h1>Apply for a Loan</h1>

      {/* Loan Type Selection */}
      <div className="loan-type-selector">
        <label>Select Loan Type:</label>
        <select value={loanType} onChange={(e) => setLoanType(e.target.value)}>
          <option value="home">Home Loan</option>
          <option value="general">General Loan</option>
          <option value="credit">Credit Card Approval</option>
        </select>
      </div>

      {/* Loan Application Form */}
      <form onSubmit={handleSubmit} className="loan-form">
      {(formFields[loanType] || []).map((field, idx) => (
        <div key={idx} className="auth-input-group">
          <label>{field.label}:</label>
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name] !== undefined ? formData[field.name] : ""}
            onChange={handleChange}
            required
          />
        </div>
      ))}
        <button type="submit" className="apply-button">
          Submit Application
        </button>
      </form>

      {/* Toggle Switch for Fair Model */}
      <div className="bias-toggle">
        <button
          onClick={toggleFairMode}
          className={`toggle-button ${isFairMode ? "active" : ""}`}
        >
          {isFairMode ? "Fair Model Mode" : "Standard Model Mode"}
        </button>
      </div>

      {/* Button to Predict Loan Outcome */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={predictLoanOutcome} className="apply-button">
          Predict Loan Outcome
        </button>
      </div>

      {/* Display Prediction and Explanation */}
      {prediction && (
        <div
          className={`prediction-result ${
            prediction.includes("Approved") ? "approved" : "rejected"
          }`}
          style={{ marginTop: "20px" }}
        >
          <p><strong>Prediction:</strong> {prediction}</p>
          {explanation && <p><strong>Explanation:</strong> {explanation}</p>}
        </div>
      )}

      {/* Display Fairness Information if available */}
      {fairness && (
        <div
          className="fairness-info"
          style={{
            marginTop: "20px",
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3>Prediction Details</h3>
          <p><strong>Approval Probability:</strong> {fairness.approval_probability}</p>
          <p><strong>Model Accuracy:</strong> {fairness.model_accuracy}</p>

          <h4>Key Factors Affecting Decision:</h4>
          {fairness.key_factors && fairness.key_factors.length > 0 ? (
            <>
              <table className="impact-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Current Value</th>
                    <th>Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {fairness.key_factors.map((kf, idx) => (
                    <tr key={idx}>
                      <td>{kf.feature}</td>
                      <td>{kf.current_value}</td>
                      <td>{kf.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="chart-container" style={{ marginTop: "20px" }}>
                {fairness.chartData ? (
                  <Bar data={fairness.chartData} options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      title: { display: true, text: "Key Factors Impact" },
                    },
                    scales: { y: { beginAtZero: true } },
                  }} />
                ) : (
                  <p>No chart data available.</p>
                )}
              </div>
            </>
          ) : (
            <p>No key factors available.</p>
          )}

          <h4>Suggested Improvements (Ranked by Impact):</h4>
          {fairness.suggestions && fairness.suggestions.length > 0 ? (
            <table className="suggestions-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Current</th>
                  <th>Target</th>
                  <th>Expected Improvement</th>
                  <th>New Approval Probability</th>
                </tr>
              </thead>
              <tbody>
                {fairness.suggestions.map((sugg, idx) => (
                  <tr key={idx}>
                    <td>{sugg.feature}</td>
                    <td>{sugg.current}</td>
                    <td>{sugg.target}</td>
                    <td>{sugg.expected_improvement}</td>
                    <td>{sugg.new_approval_probability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No suggested improvements available.</p>
          )}

          <h4>Fairness Metrics:</h4>
          <div>
            <strong>Initial Metrics:</strong>
            <pre>{JSON.stringify(fairness.initial_metrics, null, 2)}</pre>
          </div>
          <div>
            <strong>Post-Mitigation Metrics:</strong>
            <pre>{JSON.stringify(fairness.post_metrics, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Back to Home Link */}
      <div style={{ marginTop: "20px" }}>
        <Link to="/home" className="back-button">
          ⬅ Back to Home
        </Link>
      </div>
    </div>
  );
};

export default LoanApplication;
