import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8004/api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmation: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.password !== formData.confirmation) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await axios.post(`/api/.replace("/api", "")}/register`, formData);
      setMessage("✅ Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError("❌ Registration failed. Please check your input or try again.");
    }
  };

  return (
    <div className="container mt-5 pt-5 d-flex justify-content-center">
      <div className="card shadow-sm p-4" style={{ maxWidth: "420px", width: "100%" }}>
        <h3 className="text-center text-primary mb-3">Create Your Account</h3>

        {message && <div className="alert alert-success text-center">{message}</div>}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-semibold">
              Username
            </label>
            <input
              id="username"
              name="username"
              className="form-control"
              placeholder="Enter username"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="Enter email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmation" className="form-label fw-semibold">
              Confirm Password
            </label>
            <input
              id="confirmation"
              name="confirmation"
              type="password"
              className="form-control"
              placeholder="Re-enter password"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="follow_like login btn btn-primary w-100">
            Register
          </button>
        </form>

        <div className="text-center mt-3">
          <small>
            Already have an account?{" "}
            <Link to="/login" className="register text-decoration-none text-primary">
              Login here
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
