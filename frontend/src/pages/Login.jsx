import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("Login response:", data);

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      if (!data.token) {
        setError("Login succeeded, but the server did not return a token.");
        return;
      }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      console.log("Token saved:", Boolean(sessionStorage.getItem("token")));
      console.log("Navigating to dashboard...");

      // Temporary debugging navigation
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-brand">
          Digital<span>Heroes</span>
        </Link>

        <p className="login-label">WELCOME BACK</p>

        <h1>Sign in to your account</h1>

        <p className="login-description">
          Continue your golf journey and make an impact.
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="email">Email address</label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="login-register-text">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>

        <Link to="/" className="login-back-link">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

export default Login;