import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      navigate("/login");
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <Link to="/" className="login-brand">
          Digital<span>Heroes</span>
        </Link>

        <p className="register-label">START YOUR JOURNEY</p>

        <h1>Create Your Account</h1>

        <p className="register-subtitle">
          Join the community. Improve your game and make a real impact.
        </p>

        {error && <div className="register-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="e.g. Alexander Vance"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            minLength="8"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="register-login">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>

        <Link to="/" className="register-home">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

export default Register;
