import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Components/Dashboard";
import Transactions from "./Pages/Transactions";
import LoanApplication from "./Pages/LoanApplication";
import BiasBustingPage from "./Pages/BiasBustingPage"; // Fairness page
import SettingsPage from "./Pages/Settings";
import FraudAIDashboard from "./Pages/FraudAlerts";
import AlternativeCreditPrediction from "./Pages/AlternativeCreditPrediction"; // New alternative credit score page

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/LoanApplication" element={<LoanApplication />} />
        <Route path="/BiasBustingPage" element={<BiasBustingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/FraudAlerts" element={<FraudAIDashboard />} />
        <Route path="/alternative-credit" element={<AlternativeCreditPrediction />} />
      </Routes>
    </Router>
  );
};

export default App;
