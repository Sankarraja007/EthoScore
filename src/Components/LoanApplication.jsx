import { useState } from "react";
import axios from "axios";

const LoanApplication = () => {
  const [income, setIncome] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const [loanStatus, setLoanStatus] = useState("");
  const [explanation, setExplanation] = useState("");

  const applyForLoan = async () => {
    try {
      const response = await axios.post("http://localhost:8000/predict-loan", { income, creditScore });
      setLoanStatus(response.data.loan_status);
      setExplanation(response.data.explanation);
    } catch (error) {
      console.error("Error predicting loan:", error);
    }
  };

  return (
    <div>
      <h2>Apply for a Loan</h2>
      <input type="number" placeholder="Income" value={income} onChange={(e) => setIncome(e.target.value)} />
      <input type="number" placeholder="Credit Score" value={creditScore} onChange={(e) => setCreditScore(e.target.value)} />
      <button onClick={applyForLoan}>Submit</button>
      {loanStatus && <p>Loan Status: {loanStatus}</p>}
      {explanation && <p>Explanation: {explanation}</p>}
    </div>
  );
};

export default LoanApplication;
