import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8004/api";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // POST to JWT token endpoint
      const response = await axios.post(`api/token/`, {
        username,
        password,
      });

      // Save tokens and username
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("username", username);

      // Set global axios auth header
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;

      setError("");

      // Callback if provided
      if (typeof onLoginSuccess === "function") {
        onLoginSuccess();
      }

      // Redirect
      navigate("/");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="container mt-5 pt-5" style={{ maxWidth: "400px" }}>
      <div className="card shadow-sm p-4">
        <h3 className="text-center mb-4">Login</h3>

        {error && (
          <div className="alert alert-danger py-2 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="follow_like login btn btn-primary w-100 fw-semibold mt-2"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="mb-0">
            Don’t have an account?{" "}
            <Link to="/register" className="register text-primary fw-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
