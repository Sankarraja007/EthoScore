import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { auth, onAuthStateChanged } from "../firebase";
import "../styles/Home.css";
import { motion } from "framer-motion";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";

// Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Navbar = ({ username, toggleDropdown, isDropdownOpen, handleLogout }) => {
  const navLinkStyle = {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "18px",
    fontWeight: "bold",
    transition: "color 0.3s ease",
  };
  const dropdownItemStyle = {
    color: "#333",
    textDecoration: "none",
    padding: "10px 15px",
    display: "block",
    borderBottom: "1px solid #ddd",
  };

  // Retrieve the avatar URL from local storage
  const avatarUrl = localStorage.getItem("avatarUrl");

  return (
    <nav
      style={{
        backgroundColor: "#1e1e2f",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      <div>
        <ul style={{ display: "flex", listStyleType: "none", margin: 0, padding: 0 }}>
          <li style={{ margin: "0 20px" }}>
            <Link to="/Transactions" style={navLinkStyle}>
              Transactions
            </Link>
          </li>
          <li style={{ margin: "0 20px" }}>
            <Link to="/LoanApplication" style={navLinkStyle}>
              Loan Application
            </Link>
          </li>
          <li style={{ margin: "0 20px" }}>
            <Link to="/BiasBustingPage" style={navLinkStyle}>
              Bias Busting
            </Link>
          </li>
          <li style={{ margin: "0 20px" }}>
            <Link to="/alternative-credit" style={navLinkStyle}>
              Alternative Credit
            </Link>
          </li>
          <li style={{ margin: "0 20px" }}>
            <Link to="/Settings" style={navLinkStyle}>
              User Profile
            </Link>
          </li>
        </ul>
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <button
          onClick={toggleDropdown}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* If an avatar is available, display it */}
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="avatar"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                marginRight: "8px",
                objectFit: "cover",
              }}
            />
          )}
          {username ? username : "Guest"}
        </button>

        {isDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "0",
              backgroundColor: "#fff",
              color: "#333",
              borderRadius: "5px",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
              padding: "10px 15px",
              minWidth: "150px",
            }}
          >
            <Link to="/Settings" style={dropdownItemStyle}>
              Profile
            </Link>
            <button onClick={handleLogout} style={dropdownItemStyle}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const Home = () => {
  const [username, setUsername] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => console.log("Logging out...");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email);
      } else {
        setUsername(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleModelClick = () => {
    setShowTransactions(!showTransactions);
  };

  return (
    <div>
      <Navbar
        username={username}
        toggleDropdown={toggleDropdown}
        isDropdownOpen={isDropdownOpen}
        handleLogout={handleLogout}
      />

      <div
        className="hero-section"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('Bank.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(5px)",
          zIndex: -1,
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="home-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "row",
          paddingTop: "80px",
        }}
      >
        <div className="other-components" style={{ marginLeft: "20px" }}>
          <div className="insight-card" style={cardStyle}>
            <h3>Account Balance</h3>
            <p>💰 ₹75,000</p>
            <p>📌 Last Transaction: ₹3,000 - Grocery</p>
          </div>
          {username ? (
            <div className="welcome-message">
              <p className="welcome-text">Welcome, {username}!</p>
            </div>
          ) : (
            <p className="welcome-text">Please sign in</p>
          )}
        </div>

        <div
          className="model-container"
          style={{ width: "50%", height: "100%", position: "relative" }}
          onClick={handleModelClick}
        >
          <Canvas camera={{ position: [6, 3, 8], fov: 45 }}>
            <ambientLight intensity={2.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} />
            <spotLight position={[10, 10, 10]} angle={0.3} intensity={1.5} castShadow />
            <hemisphereLight intensity={1} skyColor={"#ffffff"} groundColor={"#bbbbbb"} />
            <Environment preset="city" />
            <BankCardModel isHovered={isHovered} setIsHovered={setIsHovered} />
            <OrbitControls enableZoom={false} enableRotate={false} autoRotate autoRotateSpeed={2} />
          </Canvas>
          {isHovered && <div style={hoverMessageStyle}>Scroll down below for account insights</div>}
        </div>
      </motion.div>

      <div
        className="charts-buttons"
        style={{
          backgroundColor: "#007BFF",
          padding: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button onClick={() => setShowTransactions(false)} style={buttonStyle}>
          Quick Insights
        </button>
        <button onClick={() => setShowTransactions(true)} style={buttonStyle}>
          Transaction History
        </button>
      </div>

      {!showTransactions ? (
        <div className="insights-container" style={{ padding: "50px", backgroundColor: "#ffffff" }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Quick Insights</h2>
          <div className="insights-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            <div className="insight-card" style={cardStyle}>
              <h3>Loan Status</h3>
              <p>🏦 Loan Amount: ₹5,00,000</p>
              <p>📅 EMI Due: 10th Feb</p>
            </div>
            <div className="insight-card" style={cardStyle}>
              <h3>Spending Breakdown</h3>
              <Pie data={spendingData} />
            </div>
            <div className="insight-card" style={cardStyle}>
              <h3>Income vs Expenses</h3>
              <Bar data={incomeExpenseData} />
            </div>
          </div>
        </div>
      ) : (
        <div className="transaction-history" style={{ padding: "50px", backgroundColor: "#f1f1f1" }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Transaction History</h2>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            <li>₹3000 - Grocery - 10th Jan</li>
            <li>₹1500 - Shopping - 12th Jan</li>
            <li>₹5000 - Bills - 15th Jan</li>
          </ul>
        </div>
      )}
    </div>
  );
};

const BankCardModel = ({ isHovered, setIsHovered }) => {
  const modelRef = useRef();
  const { scene } = useGLTF("/bank_cards.glb");

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.rotation.set(0, Math.PI / 2, 0);
    }
  }, []);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01;
    }
  });

  return (
    <primitive
      object={scene}
      scale={2.3}
      position={[0, -1, 0]}
      ref={modelRef}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    />
  );
};

const hoverMessageStyle = {
  position: "absolute",
  bottom: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  color: "#fff",
  backgroundColor: "#000",
  padding: "10px",
  borderRadius: "5px",
};

const buttonStyle = {
  backgroundColor: "#ffffff",
  padding: "10px 20px",
  margin: "0 10px",
  borderRadius: "5px",
  cursor: "pointer",
  transition: "background-color 0.3s",
};

const cardStyle = {
  backgroundColor: "#f8f9fa",
  padding: "20px",
  borderRadius: "5px",
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
};

const spendingData = {
  labels: ["Groceries", "Bills", "Shopping", "Entertainment"],
  datasets: [
    {
      data: [3000, 1500, 1000, 500],
      backgroundColor: ["#FF5733", "#33FF57", "#3357FF", "#FFD700"],
      hoverOffset: 4,
    },
  ],
};

const incomeExpenseData = {
  labels: ["Income", "Expenses"],
  datasets: [
    {
      label: "Income vs Expenses",
      data: [10000, 5000],
      backgroundColor: "#4CAF50",
      borderColor: "#4CAF50",
      borderWidth: 1,
    },
  ],
};

export default Home;
