import React, { useState } from "react";
import "../styles/LoanApplication.css"; // Updated styles
import { Link } from "react-router-dom"; // Import Link for routing

const LoanApplication = () => {
  const [loanType, setLoanType] = useState("home");
  const [formData, setFormData] = useState({
    name: "",
    income: "",
    creditScore: "",
    loanAmount: "",
    employmentType: "Salaried",
    propertyValue: "",
    businessYears: "",
    existingLoans: "No",
  });

  const [prediction, setPrediction] = useState(null); 
  const [explanation, setExplanation] = useState(""); 
  const [isBiasMode, setIsBiasMode] = useState(false); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/predictLoan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, loanType, isBiasMode }),
      });
      const result = await response.json();
      setPrediction(result.prediction);
      setExplanation(result.explanation);
    } catch (error) {
      console.error("Error predicting loan:", error);
    }
  };

  const toggleBiasMode = () => {
    setIsBiasMode((prevMode) => !prevMode);
  };

  return (
    <div className={`loan-application-page ${isBiasMode ? "bias-mode" : ""}`}>
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
        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Income (₹ per month):</label>
        <input type="number" name="income" value={formData.income} onChange={handleChange} required />

        <label>Credit Score:</label>
        <input type="number" name="creditScore" value={formData.creditScore} onChange={handleChange} required min="300" max="900" />

        <label>Loan Amount (₹):</label>
        <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} required />

        <label>Employment Type:</label>
        <select name="employmentType" value={formData.employmentType} onChange={handleChange}>
          <option value="Salaried">Salaried</option>
          <option value="Self-Employed">Self-Employed</option>
          <option value="Unemployed">Unemployed</option>
        </select>

        {/* Conditional Fields Based on Loan Type */}
        {loanType === "home" && (
          <>
            <label>Property Value (₹):</label>
            <input type="number" name="propertyValue" value={formData.propertyValue} onChange={handleChange} required />
          </>
        )}

        {loanType === "general" && (
          <>
            <label>Years in Business (if Self-Employed):</label>
            <input type="number" name="businessYears" value={formData.businessYears} onChange={handleChange} />
          </>
        )}

        {loanType === "credit" && (
          <>
            <label>Do you have existing loans?</label>
            <select name="existingLoans" value={formData.existingLoans} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </>
        )}
        
        {/* Submit Button */}
        <button type="submit" className="apply-button">Submit Application</button>
      </form>

      {/* Prediction Result */}
      {prediction && (
        <div className={`prediction-result ${prediction === "approved" ? "approved" : "rejected"}`}>
          <h2>{prediction === "approved" ? "✔ Approved" : "❌ Rejected"}</h2>
        </div>
      )}

      {/* Explainability */}
      {explanation && (
        <div className="explanation">
          <h3>Why was this decision made?</h3>
          <p>{explanation}</p>
        </div>
      )}

      {/* Bias Busting Mode Toggle */}
      <div className="bias-toggle">
        <button
          className={`toggle-button ${isBiasMode ? "active" : ""}`}
          onClick={toggleBiasMode}
        >
          {isBiasMode ? "Switch to Regular Model" : "Switch to Fair Model"}
        </button>
      </div>

      {/* Back to Home Button */}
      <div className="mt-8">
        <Link to="/home" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-lg hover:bg-blue-700 transition duration-300">
          ↩️ Back to Home
        </Link>
      </div>
    </div>
  );
};

export default LoanApplication;
