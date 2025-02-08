import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Components/Dashboard";
import Transactions from "./Pages/Transactions";
import LoanApplication from "./Pages/LoanApplication";
import BiasBustingPage from "./Pages/BiasBustingPage"; // Import your new page
import SettingsPage from "./Pages/Settings"; // Import the SettingsPage component
import FraudAIDashboard from "./Pages/FraudAlerts";



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
        <Route path="/settings" element={<SettingsPage />} /> {/* Added route for Settings Page */}
        <Route path="/FraudAlerts" element={<FraudAIDashboard />} /> {/* Added route for Settings Page */}

      </Routes>
    </Router>
  );
};

export default App;
