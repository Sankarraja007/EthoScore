import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Only using Firebase Auth for user info
import { onAuthStateChanged } from "firebase/auth";
import { Search } from "lucide-react";

// (For security, move these keys to environment variables in production)
const GOOGLE_API_KEY = "AIzaSyCSH46ZBrO5sEBAEVwf7rRm1FE1k66ZhIY";
const SEARCH_ENGINE_ID = "92bd6086d0b9c42d5";

const SettingsPage = () => {
  const navigate = useNavigate();

  // State for user details, 2FA, and dark mode
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // States for avatar search and selection
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // Fetch user details from Firebase Auth on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserDetails({
          name: user.displayName || "",
          email: user.email || "",
          phone: "", // Not updating phone from Firebase in this example
          avatarUrl: user.photoURL || "",
        });

        // Override the avatarUrl if one is stored locally
        const storedAvatar = localStorage.getItem("avatarUrl");
        if (storedAvatar) {
          setUserDetails((prev) => ({ ...prev, avatarUrl: storedAvatar }));
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle changes in user details form fields
  const handleUserDetailsChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image search for avatars using Google Custom Search API
  const handleImageSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(
          searchQuery
        )}&searchType=image`
      );
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Error searching images:", error);
      alert("Failed to search images");
    }
    setIsSearching(false);
  };

  // Handle avatar selection
  const handleAvatarSelect = (imageUrl) => {
    setSelectedAvatar(imageUrl);
    setUserDetails((prev) => ({ ...prev, avatarUrl: imageUrl }));
  };

  // Save changes locally (only avatar is stored locally)
  const handleSaveChanges = () => {
    // Save the avatar URL in local storage
    localStorage.setItem("avatarUrl", userDetails.avatarUrl);
    // (You can also save other details locally if needed)
    alert("Profile updated successfully (locally)!");
  };

  // Toggle 2FA setting (saved locally for this example)
  const handle2FAToggle = () => {
    setIs2FAEnabled((prev) => !prev);
  };

  // Toggle dark mode, update UI, and optionally save preference locally
  const handleDarkModeToggle = () => {
    const newState = !isDarkMode;
    setIsDarkMode(newState);
    document.body.style.backgroundColor = newState ? "#121212" : "#fff";
    document.body.style.color = newState ? "#fff" : "#121212";
    localStorage.setItem("isDarkMode", newState);
  };

  // Navigate back to Home
  const handleBackToHome = () => navigate("/home");

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#121212" : "#fff",
        color: isDarkMode ? "#fff" : "#121212",
        padding: "24px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "24px",
        }}
      >
        ⚙️ Settings & Profile
      </h1>

      {/* Avatar Section */}
      <div
        style={{
          backgroundColor: "#1E1E1E",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
          🖼️ Profile Avatar
        </h2>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <img
            src={userDetails.avatarUrl || "/default-avatar.png"}
            alt="Profile"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              marginRight: "20px",
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for avatar images..."
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: "#2e2e2e",
                  color: "#fff",
                  marginRight: "10px",
                }}
              />
              <button
                onClick={handleImageSearch}
                disabled={isSearching}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#36a2eb",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Search size={16} style={{ marginRight: "8px" }} />
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "10px",
            }}
          >
            {searchResults.map((result, index) => (
              <img
                key={index}
                src={result.link}
                alt={result.title}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  cursor: "pointer",
                  border: userDetails.avatarUrl === result.link ? "2px solid #36a2eb" : "none",
                  borderRadius: "4px",
                }}
                onClick={() => handleAvatarSelect(result.link)}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Details */}
      <div
        style={{
          backgroundColor: "#1E1E1E",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>👤 User Details</h2>
        <form>
          <label style={{ display: "block", marginBottom: "8px", color: "#ccc" }}>
            Name
          </label>
          <input
            type="text"
            name="name"
            value={userDetails.name}
            onChange={handleUserDetailsChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: "#2e2e2e",
              color: "#fff",
            }}
          />

          <label
            style={{ display: "block", marginTop: "16px", marginBottom: "8px", color: "#ccc" }}
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            value={userDetails.email}
            disabled
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: "#2e2e2e",
              color: "#ccc",
            }}
          />

          <label
            style={{ display: "block", marginTop: "16px", marginBottom: "8px", color: "#ccc" }}
          >
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={userDetails.phone}
            onChange={handleUserDetailsChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: "#2e2e2e",
              color: "#fff",
            }}
          />
        </form>
      </div>

      {/* 2FA Toggle */}
      <div
        style={{
          backgroundColor: "#1E1E1E",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>🔐 Two-Factor Authentication</h2>
        <p style={{ color: "#ccc" }}>
          Enable Two-Factor Authentication (2FA) for extra security.
        </p>
        <button
          onClick={handle2FAToggle}
          style={{
            padding: "10px 20px",
            backgroundColor: is2FAEnabled ? "#ff7f50" : "#36a2eb",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
        </button>
      </div>

      {/* Dark Mode Toggle */}
      <div style={{ backgroundColor: "#1E1E1E", padding: "20px", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>🌙 Dark Mode</h2>
        <p style={{ color: "#ccc" }}>
          Toggle dark mode for a more comfortable experience.
        </p>
        <button
          onClick={handleDarkModeToggle}
          style={{
            padding: "10px 20px",
            backgroundColor: isDarkMode ? "#ff7f50" : "#36a2eb",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>

      {/* Save Changes & Back Button */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={handleSaveChanges}
          style={{
            padding: "12px 24px",
            marginRight: "10px",
            backgroundColor: "#28a745",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Save Changes
        </button>
        <button
          onClick={handleBackToHome}
          style={{
            padding: "12px 24px",
            backgroundColor: "#36a2eb",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
