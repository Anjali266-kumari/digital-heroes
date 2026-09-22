import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Register from "./pages/Register.jsx";

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <span className="logo-icon">D</span>
          <span className="logo-text">Digital Heroes</span>
        </Link>

        <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
          <a href="#how-it-works" onClick={closeMobileMenu}>
            How It Works
          </a>
          <a href="#charity" onClick={closeMobileMenu}>
            Charities
          </a>
          <a href="#rewards" onClick={closeMobileMenu}>
            Rewards
          </a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="login-btn" onClick={closeMobileMenu}>
            Log In
          </Link>

          <Link to="/register" className="nav-cta" onClick={closeMobileMenu}>
            Join Now ↗
          </Link>

          <button
            className={`mobile-toggle ${mobileMenuOpen ? "open" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle Navigation Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            GOLF WITH A GREATER PURPOSE
          </div>

          <h1>
            Your game.
            <br />
            Your impact.
            <br />
            <span>Every month.</span>
          </h1>

          <p className="hero-description">
            Track your golf performance, support the causes you care about, and
            take part in monthly prize draws. Every round can make a difference.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-btn">
              Become a Member <span>↗</span>
            </Link>

            <a href="#how-it-works" className="secondary-link">
              Discover how it works <span>↓</span>
            </a>
          </div>

          <div className="hero-note">
            <span>✓</span> Golf, rewards, and meaningful impact in one place
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-glow"></div>

          <div className="impact-card">
            <div className="card-top">
              <span className="card-label">YOUR MONTHLY IMPACT</span>
              <span className="card-icon">↗</span>
            </div>

            <div className="impact-amount">£12.50</div>

            <p className="impact-caption">
              Example contribution to your chosen charity
            </p>

            <div className="impact-divider"></div>

            <div className="charity-row">
              <div className="charity-avatar">♥</div>

              <div>
                <p className="charity-title">Your chosen charity</p>
                <p className="charity-subtitle">
                  Making every contribution count
                </p>
              </div>

              <span className="charity-check">✓</span>
            </div>
          </div>

          <div className="floating-tag tag-top">
            <span className="tag-icon">⛳</span>
            Play with purpose
          </div>

          <div className="floating-tag tag-bottom">
            <span className="tag-icon">✨</span>
            Monthly rewards
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="feature-strip" id="how-it-works">
        <div className="feature-item">
          <span className="feature-number">01</span>

          <div>
            <h3>Track your game</h3>
            <p>Record your Stableford scores effortlessly after each round.</p>
          </div>
        </div>

        <div className="feature-item">
          <span className="feature-number">02</span>

          <div>
            <h3>Support a cause</h3>
            <p>
              Choose a charity close to your heart and generate real
              contributions.
            </p>
          </div>
        </div>

        <div className="feature-item" id="rewards">
          <span className="feature-number">03</span>

          <div>
            <h3>Enter monthly draws</h3>
            <p>
              Take part in exclusive monthly prize draws for active golfers.
            </p>
          </div>
        </div>
      </section>

      <section className="charity-section" id="charity">
        <div className="section-heading">
          <span className="section-eyebrow">MORE THAN A GAME</span>

          <h2>
            Play for yourself.
            <br />
            <span>Make a difference for others.</span>
          </h2>

          <p>
            Your passion for golf can help support the causes that matter to
            you. Choose a charity and make your participation meaningful.
          </p>

          <Link to="/register" className="primary-btn">
            Explore Charities <span>↗</span>
          </Link>
        </div>

        <div className="charity-visual">
          <div className="charity-symbol">💚</div>
          <span>YOUR GAME CAN CREATE CHANGE</span>
        </div>
      </section>

      <footer className="footer">
        <Link to="/" className="logo">
          <span className="logo-icon">D</span>
          Digital Heroes
        </Link>

        <p>Golf with purpose. Every contribution matters.</p>

        <span className="footer-copy">© 2026 Digital Heroes</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            sessionStorage.getItem("token") ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
