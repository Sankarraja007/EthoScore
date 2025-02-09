import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import '../styles/Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    panNumber: '',
    aadhaarNumber: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  // Validation Functions
  const isValidPAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  const isValidAadhaar = (aadhaar) => /^[0-9]{12}$/.test(aadhaar);
  const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, phone, address, panNumber, aadhaarNumber, username, password, confirmPassword } = formData;

    // Form Validations
    if (!username.trim()) return setErrorMessage("Username cannot be empty.");
    if (!isValidPAN(panNumber)) return setErrorMessage("Invalid PAN Number format.");
    if (!isValidAadhaar(aadhaarNumber)) return setErrorMessage("Aadhaar Number must be 12 digits.");
    if (!isValidPhone(phone)) return setErrorMessage("Invalid Phone Number.");
    if (password.length < 6) return setErrorMessage("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setErrorMessage("Passwords do not match!");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        phone,
        address,
        panNumber,
        aadhaarNumber,
        username,
        uid: user.uid,
      });

      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Signup Error:", error);
      setErrorMessage(error.message);
    }
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <img src="/EthoScore.png" alt="EthoScore Logo" className="logo" />
      </div>

      <h2 className="auth-title">Signup</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {[
          { label: "Full Name", name: "fullName", type: "text", placeholder: "Enter your full name" },
          { label: "Email", name: "email", type: "email", placeholder: "Enter your email" },
          { label: "Username", name: "username", type: "text", placeholder: "Create a username" },
          { label: "Phone Number", name: "phone", type: "tel", placeholder: "Enter your phone number" },
          { label: "Address", name: "address", type: "text", placeholder: "Enter your address" },
          { label: "PAN Number", name: "panNumber", type: "text", placeholder: "Enter your PAN number" },
          { label: "Aadhaar Number", name: "aadhaarNumber", type: "text", placeholder: "Enter your Aadhaar number" },
          { label: "Password", name: "password", type: "password", placeholder: "Create a password" },
          { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "Confirm your password" },
        ].map((field, index) => (
          <div key={index} className="auth-input-group">
            <label>{field.label}:</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder={field.placeholder}
            />
          </div>
        ))}

        <div className="link-container">
          <p>Have an account? <span className="link" onClick={() => navigate('/')}>Login</span></p>
        </div>

        <button type="submit" className="auth-button">Signup</button>
      </form>

      {errorMessage && (
        <div className="error-popup">
          <div className="error-popup-content">
            <span className="error-popup-close" onClick={() => setErrorMessage('')}>×</span>
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <button className="error-popup-button" onClick={() => setErrorMessage('')}>Close</button>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="success-popup">
          <div className="success-popup-content">
            <h3>Account Created Successfully!</h3>
            <p>Welcome to the banking platform. Your account has been successfully created.</p>
            <button className="success-popup-button" onClick={handlePopupClose}>Proceed to Login</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
