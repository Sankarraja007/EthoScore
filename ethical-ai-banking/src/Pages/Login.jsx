import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // State for username
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Error state to handle errors
  const [emailError, setEmailError] = useState(false); // For email error
  const [passwordError, setPasswordError] = useState(false); // For password error
  const [isResetMode, setIsResetMode] = useState(false); // To toggle between login and reset modes
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email && !username) {
      setError('Email or Username is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      let userCredential;

      if (email) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Find user by username
        const userSnapshot = await getDoc(doc(db, 'users', username));
        if (!userSnapshot.exists()) {
          setError('Username not found');
          return;
        }
        const user = userSnapshot.data();
        userCredential = await signInWithEmailAndPassword(auth, user.email, password); // Login with email associated with username
      }

      navigate('/home'); // Redirect to home after successful login
    } catch (error) {
      setError('Invalid credentials');
      setEmailError(true);
      setPasswordError(true);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Password reset email sent!');
      setIsResetMode(false); // Close reset mode after sending email
    } catch (error) {
      setError('Error sending password reset email');
    }
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <img src="/EthoScore.png" alt="EthoScore Logo" className="logo" />
      </div>

      <h2 className="auth-title">Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className={`auth-input-group ${emailError ? 'error' : ''}`}>
          <label>{username ? 'Username' : 'Email'}:</label>
          <input
            type="text"
            value={username ? username : email}
            onChange={(e) => (username ? setUsername(e.target.value) : setEmail(e.target.value))}
            required
            className="auth-input"
            placeholder={`Enter your ${username ? 'username' : 'email'}`}
          />
        </div>

        <div className={`auth-input-group ${passwordError ? 'error' : ''}`}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="auth-button">Login</button>

        {/* Forgot Password Link */}
        <div className="forgot-password-container">
          <span
            className="forgot-password-link"
            onClick={() => setIsResetMode(true)} // Show reset password modal
          >
            Forgot Password?
          </span>
        </div>
      </form>

      {/* Error Popup */}
      {error && (
        <div className="error-popup">
          <div className="error-popup-content">
            <span className="error-popup-close" onClick={() => setError(null)}>×</span>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetMode && (
        <div className="reset-modal">
          <div className="reset-modal-content">
            <h3>Reset Password</h3>
            <input
              type="email"
              placeholder="Enter your email address"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <button onClick={handlePasswordReset}>Send Reset Link</button>
            <button onClick={() => setIsResetMode(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="link-container">
        <p>Don't have an account? <span className="link" onClick={() => navigate('/signup')}>Sign up</span></p>
      </div>
    </div>
  );
};

export default Login;
