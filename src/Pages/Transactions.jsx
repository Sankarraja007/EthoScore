import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Pie, Line } from "react-chartjs-2";
import "../styles/Transactions.css"; // Ensure styles are updated
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const Transactions = () => {
  const [sortOption, setSortOption] = useState("date");
  const [fraudDetection, setFraudDetection] = useState(false);

  // Sample transaction data
  const transactions = [
    { id: 1, date: "2025-02-01", amount: 3000, type: "Grocery", status: "Completed", fraud: false },
    { id: 2, date: "2025-02-02", amount: 1500, type: "Shopping", status: "Pending", fraud: true },
    { id: 3, date: "2025-01-25", amount: 5000, type: "Bills", status: "Completed", fraud: false },
    { id: 4, date: "2025-02-10", amount: 1000, type: "Entertainment", status: "Completed", fraud: false },
    { id: 5, date: "2025-02-12", amount: 4500, type: "Shopping", status: "Completed", fraud: true },
  ];

  // Sorting logic
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortOption === "date") return new Date(b.date) - new Date(a.date);
    if (sortOption === "amount") return b.amount - a.amount;
    return 0;
  });

  // Data for Pie Chart (Spending Categories)
  const categoryTotals = transactions.reduce((acc, transaction) => {
    acc[transaction.type] = (acc[transaction.type] || 0) + transaction.amount;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF"],
      },
    ],
  };

  // Data for Line Chart (Monthly Transaction Trends)
  const monthlyTotals = transactions.reduce((acc, transaction) => {
    const month = transaction.date.slice(0, 7);
    acc[month] = (acc[month] || 0) + transaction.amount;
    return acc;
  }, {});

  const lineData = {
    labels: Object.keys(monthlyTotals),
    datasets: [
      {
        label: "Monthly Spending",
        data: Object.values(monthlyTotals),
        fill: false,
        borderColor: "#36A2EB",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className={`transactions-page ${fraudDetection ? "fraud-mode" : ""}`}>
      <div className="transactions-header">
        <h1>Transaction History</h1>
        <div className="filter-section">
          <label htmlFor="sortOption">Sort by:</label>
          <select
            id="sortOption"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="sort-dropdown"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
        </div>
      </div>

      {/* Fraud Detection Toggle */}
      <div className="fraud-toggle">
        <label className="switch">
          <input type="checkbox" checked={fraudDetection} onChange={() => setFraudDetection(!fraudDetection)} />
          <span className="slider round"></span>
        </label>
        <span className="toggle-label">Fraud Detection Mode</span>
      </div>

      {/* Transactions Table */}
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((transaction) => (
            <tr key={transaction.id} className={fraudDetection && transaction.fraud ? "fraud" : ""}>
              <td>{transaction.date}</td>
              <td>₹{transaction.amount}</td>
              <td>{transaction.type}</td>
              <td className={`status ${transaction.status.toLowerCase()}`}>
                {transaction.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Graphs & Insights */}
      <div className="graphs-insights">
        <h2>Graphs & Insights</h2>
        <div className="charts-container">
          <div className="chart">
            <h3>Spending Categories</h3>
            <Pie data={pieData} />
          </div>
          <div className="chart">
            <h3>Monthly Transaction Trends</h3>
            <Line data={lineData} />
          </div>
        </div>
      </div>

      {/* Back to Home Button */}
      <div className="back-button-container">
        <Link to="/home" className="back-button">⬅ Back to Home</Link>
      </div>
    </div>
  );
};

export default Transactions;
