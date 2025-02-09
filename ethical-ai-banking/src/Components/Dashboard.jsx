// src/Components/Dashboard.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  // Sample balance – you might eventually fetch this from the backend too.
  const [balance, setBalance] = useState(15200.75);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Update the URL to match the new backend endpoint
    axios
      .get("http://127.0.0.1:5000/api/fraud/transactions")
      .then(response => {
        // Assuming response.data is an array of transactions
        setTransactions(response.data);
        setError('');
      })
      .catch(err => {
        console.error("Error fetching transactions:", err);
        setError("Error fetching transactions.");
      });
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">Account Balance: ₹{balance}</h2>
      <h3 className="mt-4 text-lg">Recent Transactions</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {transactions.length > 0 ? (
          transactions.map(txn => (
            // Use txn.id if available; if not, adjust according to the data structure.
            <li key={txn.id || txn.transactionId}>
              {txn.date} - ₹{txn.amount} ({txn.category})
            </li>
          ))
        ) : (
          <li>No transactions available.</li>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
