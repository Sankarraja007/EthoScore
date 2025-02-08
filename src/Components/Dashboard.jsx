import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [balance, setBalance] = useState(15200.75);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/transactions")
      .then(response => setTransactions(response.data))
      .catch(error => console.error("Error fetching transactions:", error));
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">Account Balance: ₹{balance}</h2>
      <h3 className="mt-4 text-lg">Recent Transactions</h3>
      <ul>
        {transactions.map(txn => (
          <li key={txn.id}>{txn.date} - ₹{txn.amount} ({txn.category})</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
