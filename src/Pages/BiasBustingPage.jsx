import React, { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Import Link for routing

const BiasBustingPage = () => {
  const [genderBias, setGenderBias] = useState(50);
  const [raceBias, setRaceBias] = useState(50);

  const fairnessDataBefore = [{ category: "Before", GenderBias: 75, RaceBias: 70 }];
  const fairnessDataAfter = [{ category: "After", GenderBias: 100 - genderBias, RaceBias: 100 - raceBias }];
  const loanApprovalData = [
    { category: "Biased Model", Approvals: 60, Rejections: 40 },
    { category: "Bias-Free Model", Approvals: 85, Rejections: 15 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black text-white p-8 font-sans flex flex-col items-center">
      {/* Title */}
      <motion.h1 
        className="text-center text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}>
        🔍 Bias Busting & Fairness Transparency
      </motion.h1>

      {/* Loan Approval Comparison */}
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg mb-8 w-full max-w-4xl">
        <h2 className="text-2xl mb-4 text-blue-300">🏦 Loan Approvals: Biased vs. Bias-Free</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={loanApprovalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" stroke="#fff" />
            <YAxis domain={[0, 100]} stroke="#fff" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Approvals" fill="#36a2eb" barSize={40} radius={[5, 5, 0, 0]} />
            <Bar dataKey="Rejections" fill="#ff4d4d" barSize={40} radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fairness Before & After Graphs */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 w-full max-w-4xl">
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl mb-4 text-blue-300">📊 Fairness Before Adjustment</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fairnessDataBefore}>
              <XAxis dataKey="category" stroke="#fff" />
              <YAxis domain={[0, 100]} stroke="#fff" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="GenderBias" stroke="#ff7f50" strokeWidth={3} dot={{ r: 6 }} />
              <Line type="monotone" dataKey="RaceBias" stroke="#36a2eb" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl mb-4 text-blue-300">📊 Fairness After Adjustment</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fairnessDataAfter}>
              <XAxis dataKey="category" stroke="#fff" />
              <YAxis domain={[0, 100]} stroke="#fff" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="GenderBias" stroke="#ff7f50" strokeWidth={3} dot={{ r: 6 }} />
              <Line type="monotone" dataKey="RaceBias" stroke="#36a2eb" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg mb-8 w-full max-w-4xl">
        <h2 className="text-xl mb-4 text-blue-300">🎚️ Adjust Fairness Parameters</h2>
        <div className="space-y-6">
          <div>
            <label className="block mb-2">🔹 Gender Bias Reduction: {100 - genderBias}% Fair</label>
            <input 
              type="range" min="0" max="100" value={genderBias} 
              onChange={(e) => setGenderBias(Number(e.target.value))} 
              className="w-full cursor-pointer accent-blue-400" 
            />
          </div>
          <div>
            <label className="block mb-2">🔹 Racial Bias Reduction: {100 - raceBias}% Fair</label>
            <input 
              type="range" min="0" max="100" value={raceBias} 
              onChange={(e) => setRaceBias(Number(e.target.value))} 
              className="w-full cursor-pointer accent-blue-400" 
            />
          </div>
        </div>
      </div>

      {/* AI Fairness Explanation */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-4xl">
        <h2 className="text-xl mb-4 text-blue-300">📖 Understanding AI Bias & Fairness</h2>
        <p className="text-gray-300">
          AI models trained on historical financial data often inherit biases related to gender, race, and income levels.
          Fairlearn helps mitigate these biases by adjusting model weights to ensure equitable decisions.
        </p>
        <ul className="mt-4 text-gray-400 space-y-2">
          <li>🔹 <b>Why does bias occur?</b> → AI models learn patterns from past data, which may contain discrimination.</li>
          <li>🔹 <b>How do we fix it?</b> → Fairlearn reweights data and applies constraints to improve fairness.</li>
          <li>🔹 <b>What’s the impact?</b> → More inclusive financial services, preventing unfair loan rejections.</li>
        </ul>
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

export default BiasBustingPage;
