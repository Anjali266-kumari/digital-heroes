import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [scores, setScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(true);

  const [stablefordScore, setStablefordScore] = useState("");
  const [playedAt, setPlayedAt] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);

  const [editingScoreId, setEditingScoreId] = useState(null);
  const [editScore, setEditScore] = useState("");
  const [editDate, setEditDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [loadingCharities, setLoadingCharities] = useState(true);
  const [loadingSelectedCharity, setLoadingSelectedCharity] = useState(true);
  const [selectingCharity, setSelectingCharity] = useState(false);

  const [charityContribution, setCharityContribution] = useState(10);
  const [savingContribution, setSavingContribution] = useState(false);

  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const [winnings, setWinnings] = useState([]);
  const [loadingWinnings, setLoadingWinnings] = useState(true);

  const fetchScores = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/scores", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setScores(data.scores || []);
      } else {
        console.error("Fetch scores error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setLoadingScores(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/charities");

        const data = await response.json();

        if (response.ok) {
          setCharities(data);
        } else {
          console.error("Fetch charities error:", data.message);
        }
      } catch (error) {
        console.error("Error fetching charities:", error);
      } finally {
        setLoadingCharities(false);
      }
    };

    fetchCharities();
  }, []);

  useEffect(() => {
    const fetchSelectedCharity = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/charities/selected",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          setSelectedCharity(data.selectedCharity);
          setCharityContribution(data.charityContribution || 10);
        } else {
          console.error("Fetch selected charity error:", data.message);
        }
      } catch (error) {
        console.error("Error fetching selected charity:", error);
      } finally {
        setLoadingSelectedCharity(false);
      }
    };

    fetchSelectedCharity();
  }, []);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/subscriptions",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          setSubscription(data.subscription);
        } else {
          console.error("Fetch subscription error:", data.message);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, []);

  useEffect(() => {
    const fetchWinnings = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/winners/my-winnings",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          setWinnings(data || []);
        } else {
          console.error("Fetch winnings error:", data.message);
        }
      } catch (error) {
        console.error("Error fetching winnings:", error);
      } finally {
        setLoadingWinnings(false);
      }
    };

    fetchWinnings();
  }, []);

  const handleSubmitScore = async (e) => {
    e.preventDefault();

    if (!stablefordScore || !playedAt) {
      alert("Please enter your score and date.");
      return;
    }

    try {
      setSubmittingScore(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stablefordScore: Number(stablefordScore),
          playedAt: playedAt,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Golf score submitted successfully!");

        await fetchScores();

        setStablefordScore("");
        setPlayedAt("");
      } else {
        alert(data.message || "Unable to submit golf score.");
      }
    } catch (error) {
      console.error("Submit score error:", error);

      alert("Something went wrong while submitting the score.");
    } finally {
      setSubmittingScore(false);
    }
  };

  const handleEditScore = (score) => {
    setEditingScoreId(score._id);
    setEditScore(score.stablefordScore);

    const date = new Date(score.playedAt);
    const formattedDate = date.toISOString().split("T")[0];

    setEditDate(formattedDate);
  };

  const handleCancelEdit = () => {
    setEditingScoreId(null);
    setEditScore("");
    setEditDate("");
  };

  const handleSaveEdit = async (scoreId) => {
    if (!editScore || !editDate) {
      alert("Please enter score and date.");
      return;
    }

    try {
      setSavingEdit(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/scores/${scoreId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            stablefordScore: Number(editScore),
            playedAt: editDate,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert("Score updated successfully!");

        await fetchScores();

        handleCancelEdit();
      } else {
        alert(data.message || "Unable to update score.");
      }
    } catch (error) {
      console.error("Edit score error:", error);

      alert("Something went wrong while updating the score.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteScore = async (scoreId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this score?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/scores/${scoreId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert("Score deleted successfully!");

        setScores((prevScores) =>
          prevScores.filter((score) => score._id !== scoreId),
        );
      } else {
        alert(data.message || "Unable to delete score.");
      }
    } catch (error) {
      console.error("Delete score error:", error);

      alert("Something went wrong while deleting the score.");
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: plan,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscription(data.subscription);

        await fetchScores();

        alert("Subscription activated successfully!");
      } else {
        alert(data.message || "Unable to activate subscription.");
      }
    } catch (error) {
      console.error("Subscription error:", error);

      alert("Something went wrong while subscribing.");
    }
  };

  const handleCancelSubscription = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel your subscription?",
    );

    if (!confirmCancel) {
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/subscriptions/cancel",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSubscription(data.subscription);
        setScores([]);

        alert("Subscription cancelled successfully!");
      } else {
        alert(data.message || "Unable to cancel subscription.");
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);

      alert("Something went wrong while cancelling the subscription.");
    }
  };

  const handleSelectCharity = async (charityId) => {
    try {
      setSelectingCharity(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/charities/select",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            charityId: charityId,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSelectedCharity(data.selectedCharity);

        const updatedUser = {
          ...user,
          selectedCharity: data.selectedCharity,
        };

        sessionStorage.setItem("user", JSON.stringify(updatedUser));

        alert("Charity selected successfully!");
      } else {
        console.error("Select charity error:", data.message);

        alert(data.message || "Unable to select charity.");
      }
    } catch (error) {
      console.error("Error selecting charity:", error);

      alert("Something went wrong while selecting the charity.");
    } finally {
      setSelectingCharity(false);
    }
  };

  const handleSaveContribution = async () => {
    const contributionValue = Number(charityContribution);

    if (
      !Number.isInteger(contributionValue) ||
      contributionValue < 10 ||
      contributionValue > 100
    ) {
      alert("Charity contribution must be between 10% and 100%.");

      return;
    }

    try {
      setSavingContribution(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/charities/contribution",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contribution: contributionValue,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setCharityContribution(data.charityContribution);

        alert("Charity contribution updated successfully!");
      } else {
        alert(data.message || "Unable to update charity contribution.");
      }
    } catch (error) {
      console.error("Save contribution error:", error);

      alert("Something went wrong while saving your contribution.");
    } finally {
      setSavingContribution(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  const isActiveSubscriber = subscription?.status === "active";

  const totalWinnings = winnings.reduce(
    (total, winner) => total + Number(winner.prizeAmount || 0),
    0,
  );

  const paidWinnings = winnings
    .filter((winner) => winner.payoutStatus === "paid")
    .reduce((total, winner) => total + Number(winner.prizeAmount || 0), 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* HEADER */}
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <span className="dashboard-label">
              <span>⛳</span> MEMBER PORTAL
            </span>

            <h1>Welcome back, {user.name || "Golfer"}!</h1>

            <p className="dashboard-description">
              Track your golf performance, manage your supported charity, and
              submit your monthly Stableford round entries.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <Link to="/" className="home-button">
              ← Back to Home
            </Link>

            <button onClick={handleLogout} className="logout-button">
              Sign Out
            </button>
          </div>
        </header>

        <section className="dashboard-cards">
          {/* Subscription */}
          <div className="dashboard-card">
            <div className="card-header-row">
              <h3>Subscription Status</h3>
              <span className="card-icon-badge">✨</span>
            </div>

            <p className="card-value card-value-active">
              {loadingSubscription
                ? "Loading..."
                : subscription?.status === "active"
                  ? `Active (${subscription.plan})`
                  : subscription?.status === "cancelled"
                    ? "Cancelled"
                    : subscription?.status === "lapsed"
                      ? "Lapsed"
                      : "Not Subscribed"}
            </p>

            <p className="card-footer-text">
              {subscription?.status === "active" && subscription?.renewalDate
                ? `Renews on ${new Date(
                    subscription.renewalDate,
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}`
                : "No active subscription plan."}
            </p>
          </div>

          {/* Scores */}
          <div className="dashboard-card">
            <div className="card-header-row">
              <h3>Submitted Scores</h3>
              <span className="card-icon-badge">📊</span>
            </div>

            <p className="card-value">
              {loadingScores ? "..." : isActiveSubscriber ? scores.length : "—"}
            </p>

            <p className="card-footer-text">Latest Stableford score entries.</p>
          </div>

          {/* Charity */}
          <div className="dashboard-card">
            <div className="card-header-row">
              <h3>Chosen Charity</h3>
              <span className="card-icon-badge">💚</span>
            </div>

            <p
              className="card-value"
              style={{
                fontSize: "22px",
                textTransform: "capitalize",
              }}
            >
              {loadingSelectedCharity
                ? "Loading..."
                : selectedCharity?.name || "Not selected"}
            </p>

            <p className="card-footer-text">
              Supporting causes that matter to you.
            </p>
          </div>

          {/* Winnings */}
          <div className="dashboard-card">
            <div className="card-header-row">
              <h3>Total Winnings</h3>
              <span className="card-icon-badge">🏆</span>
            </div>

            <p className="card-value">
              {loadingWinnings ? "..." : `£${totalWinnings}`}
            </p>

            <p className="card-footer-text">Paid: £{paidWinnings}</p>
          </div>
        </section>

        {/* =============================== */}
        {/* PARTICIPATION SUMMARY */}
        {/* =============================== */}

        <section className="dashboard-scores-section">
          <div className="section-title-row">
            <h2>Participation Summary</h2>
          </div>

          <div className="plans-grid">
            <div className="plan-card">
              <div className="plan-header">
                <h3>Golf Rounds</h3>

                <p className="plan-price">
                  {isActiveSubscriber ? scores.length : 0}
                </p>

                <p className="plan-desc">
                  Latest Stableford rounds currently recorded in your account.
                </p>
              </div>
            </div>

            <div className="plan-card">
              <div className="plan-header">
                <h3>Draw Wins</h3>

                <p className="plan-price">{winnings.length}</p>

                <p className="plan-desc">
                  Total winning entries recorded for your account.
                </p>
              </div>
            </div>

            <div className="plan-card">
              <div className="plan-header">
                <h3>Charity Support</h3>

                <p className="plan-price">{charityContribution}%</p>

                <p className="plan-desc">
                  Your selected contribution percentage for your supported
                  charity.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-scores-section">
          <div className="section-title-row">
            <h2>Add New Golf Score</h2>

            <span className="score-badge-count">Stableford 1–45</span>
          </div>

          {loadingSubscription ? (
            <div className="empty-scores-state">
              <p>Checking subscription status...</p>
            </div>
          ) : isActiveSubscriber ? (
            <form onSubmit={handleSubmitScore} className="add-score-form">
              <div className="form-field-group">
                <label htmlFor="score-input">Stableford Score (1–45)</label>

                <input
                  id="score-input"
                  type="number"
                  min="1"
                  max="45"
                  value={stablefordScore}
                  onChange={(e) => setStablefordScore(e.target.value)}
                  placeholder="e.g. 36"
                  required
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="date-input">Round Date</label>

                <input
                  id="date-input"
                  type="date"
                  value={playedAt}
                  onChange={(e) => setPlayedAt(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submittingScore}
              >
                {submittingScore ? "Submitting..." : "Submit Score ↗"}
              </button>
            </form>
          ) : (
            <div className="empty-scores-state">
              <div className="empty-scores-icon">🔒</div>

              <p
                style={{
                  fontWeight: 800,
                  fontSize: "18px",
                  color: "var(--dark-green)",
                }}
              >
                Subscription Required
              </p>

              <p style={{ marginTop: "6px" }}>
                Please activate a subscription plan below to log and manage your
                golf scores.
              </p>

              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: "16px" }}
                onClick={() =>
                  document
                    .getElementById("subscription-plans")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Subscribe to Continue ↗
              </button>
            </div>
          )}
        </section>

        <section id="subscription-plans" className="dashboard-scores-section">
          <div className="section-title-row">
            <h2>Membership Subscription Plans</h2>

            {subscription?.status === "active" && (
              <button onClick={handleCancelSubscription} className="btn-danger">
                Cancel Subscription
              </button>
            )}
          </div>

          <div className="plans-grid">
            {/* Monthly Plan */}
            <div
              className={`plan-card ${
                subscription?.plan === "monthly" &&
                subscription?.status === "active"
                  ? "featured"
                  : ""
              }`}
            >
              {subscription?.plan === "monthly" &&
                subscription?.status === "active" && (
                  <span className="plan-badge">CURRENT PLAN</span>
                )}

              <div className="plan-header">
                <h3>Monthly Plan</h3>

                <p className="plan-price">
                  £10 <span>/ month</span>
                </p>

                <p className="plan-desc">
                  Full membership benefits, monthly prize draw entries, and
                  direct charity contributions.
                </p>
              </div>

              <button
                onClick={() => handleSubscribe("monthly")}
                disabled={
                  subscription?.plan === "monthly" &&
                  subscription?.status === "active"
                }
                className={
                  subscription?.plan === "monthly" &&
                  subscription?.status === "active"
                    ? "btn-success"
                    : "btn-primary"
                }
                style={{
                  marginTop: "16px",
                  width: "100%",
                }}
              >
                {subscription?.plan === "monthly" &&
                subscription?.status === "active"
                  ? "Active Plan ✓"
                  : "Subscribe Monthly"}
              </button>
            </div>

            {/* Yearly Plan */}
            <div
              className={`plan-card ${
                subscription?.plan === "yearly" &&
                subscription?.status === "active"
                  ? "featured"
                  : ""
              }`}
            >
              {subscription?.plan === "yearly" &&
                subscription?.status === "active" && (
                  <span className="plan-badge">CURRENT PLAN</span>
                )}

              <div className="plan-header">
                <h3>Yearly Plan</h3>

                <p className="plan-price">
                  £100 <span>/ year</span>
                </p>

                <p className="plan-desc">
                  Annual membership with 2 months free savings, priority draws,
                  and impact tracking.
                </p>
              </div>

              <button
                onClick={() => handleSubscribe("yearly")}
                disabled={
                  subscription?.plan === "yearly" &&
                  subscription?.status === "active"
                }
                className={
                  subscription?.plan === "yearly" &&
                  subscription?.status === "active"
                    ? "btn-success"
                    : "btn-primary"
                }
                style={{
                  marginTop: "16px",
                  width: "100%",
                }}
              >
                {subscription?.plan === "yearly" &&
                subscription?.status === "active"
                  ? "Active Plan ✓"
                  : "Subscribe Yearly"}
              </button>
            </div>
          </div>
        </section>

        <section className="dashboard-scores-section">
          <div className="section-title-row">
            <h2>Select Your Supported Charity</h2>

            <span className="score-badge-count">
              {charities.length} Available
            </span>
          </div>

          {loadingCharities ? (
            <div className="empty-scores-state">
              <p>Loading charities...</p>
            </div>
          ) : charities.length === 0 ? (
            <div className="empty-scores-state">
              <p>No charities are currently available.</p>
            </div>
          ) : (
            <div className="charities-grid">
              {charities.map((charity) => {
                const isSelected = selectedCharity?._id === charity._id;

                return (
                  <div
                    key={charity._id}
                    className={`charity-card-item ${
                      isSelected ? "selected" : ""
                    }`}
                  >
                    <div className="charity-card-header">
                      <div className="charity-card-avatar">💚</div>

                      <div>
                        <p className="charity-card-title">{charity.name}</p>
                      </div>
                    </div>

                    <p className="charity-card-desc">{charity.description}</p>

                    <button
                      onClick={() => handleSelectCharity(charity._id)}
                      disabled={selectingCharity || isSelected}
                      className={isSelected ? "btn-success" : "btn-secondary"}
                      style={{ width: "100%" }}
                    >
                      {isSelected
                        ? "Selected Charity ✓"
                        : selectingCharity
                          ? "Selecting..."
                          : "Select Charity"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =============================== */}
        {/* CHARITY CONTRIBUTION */}
        {/* =============================== */}

        <section className="dashboard-scores-section">
          <div className="section-title-row">
            <h2>Charity Contribution</h2>

            <span className="score-badge-count">Minimum 10%</span>
          </div>

          <div className="contribution-card">
            <p className="charity-card-desc">
              Choose the percentage of your membership contribution that you
              want to support your selected charity with.
            </p>

            {loadingSelectedCharity ? (
              <div className="empty-scores-state">
                <p>Loading contribution...</p>
              </div>
            ) : (
              <>
                <div className="form-field-group">
                  <label htmlFor="charity-contribution">
                    Contribution Percentage
                  </label>

                  <input
                    id="charity-contribution"
                    type="number"
                    min="10"
                    max="100"
                    step="1"
                    value={charityContribution}
                    onChange={(e) => setCharityContribution(e.target.value)}
                  />
                </div>

                <p
                  style={{
                    marginTop: "8px",
                    marginBottom: "16px",
                  }}
                >
                  Your contribution: <strong>{charityContribution}%</strong>
                </p>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveContribution}
                  disabled={savingContribution}
                >
                  {savingContribution ? "Saving..." : "Save Contribution ↗"}
                </button>
              </>
            )}
          </div>
        </section>

        <section className="dashboard-scores-section">
          <div className="section-title-row">
            <h2>Your Recorded Golf Scores</h2>

            <span className="score-badge-count">
              {isActiveSubscriber
                ? `${scores.length} ${
                    scores.length === 1 ? "Round" : "Rounds"
                  } Played`
                : "Subscription Required"}
            </span>
          </div>

          {loadingSubscription || loadingScores ? (
            <div className="empty-scores-state">
              <p>Loading your golf rounds...</p>
            </div>
          ) : !isActiveSubscriber ? (
            <div className="empty-scores-state">
              <div className="empty-scores-icon">🔒</div>

              <p
                style={{
                  fontWeight: 800,
                  fontSize: "18px",
                  color: "var(--dark-green)",
                }}
              >
                Subscription Required
              </p>

              <p style={{ marginTop: "6px" }}>
                An active subscription is required to view, edit, or delete your
                golf scores.
              </p>

              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: "16px" }}
                onClick={() =>
                  document
                    .getElementById("subscription-plans")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Subscribe to Continue ↗
              </button>
            </div>
          ) : scores.length === 0 ? (
            <div className="empty-scores-state">
              <div className="empty-scores-icon">⛳</div>

              <p
                style={{
                  fontWeight: 800,
                  fontSize: "18px",
                  color: "var(--dark-green)",
                }}
              >
                No rounds recorded yet
              </p>

              <p style={{ marginTop: "6px" }}>
                Your submitted Stableford scores will appear here after your
                first round!
              </p>
            </div>
          ) : (
            <div className="score-list-container">
              {scores.map((score, index) => (
                <div key={score._id || index} className="score-row-item">
                  {editingScoreId === score._id ? (
                    <div className="score-edit-form">
                      <div>
                        <label>Stableford Score</label>

                        <input
                          type="number"
                          min="1"
                          max="45"
                          value={editScore}
                          onChange={(e) => setEditScore(e.target.value)}
                        />
                      </div>

                      <div>
                        <label>Round Date</label>

                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                        />
                      </div>

                      <div className="score-edit-actions">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(score._id)}
                          disabled={savingEdit}
                          className="btn-primary"
                        >
                          {savingEdit ? "Saving..." : "Save"}
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="score-info">
                        <div className="score-avatar">⛳</div>

                        <div className="score-details-text">
                          <p className="score-title">Stableford Round</p>

                          <p className="score-date">
                            Played on{" "}
                            {new Date(score.playedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="score-value-pill">
                        {score.stablefordScore} Points
                      </div>

                      <div className="score-actions">
                        <button
                          type="button"
                          onClick={() => handleEditScore(score)}
                          className="btn-secondary"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteScore(score._id)}
                          className="btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-scores-section">
          <div className="section-title-row">
            <h2>My Winnings</h2>

            <span className="score-badge-count">
              {winnings.length} {winnings.length === 1 ? "Win" : "Wins"}
            </span>
          </div>

          {loadingWinnings ? (
            <div className="empty-scores-state">
              <p>Loading your winnings...</p>
            </div>
          ) : winnings.length === 0 ? (
            <div className="empty-scores-state">
              <div className="empty-scores-icon">🏆</div>

              <p
                style={{
                  fontWeight: 800,
                  fontSize: "18px",
                  color: "var(--dark-green)",
                }}
              >
                No winnings yet
              </p>

              <p style={{ marginTop: "6px" }}>
                Your draw winnings will appear here when you win a prize.
              </p>
            </div>
          ) : (
            <div className="score-list-container">
              {winnings.map((winner) => (
                <div key={winner._id} className="score-row-item">
                  <div className="score-info">
                    <div className="score-avatar">🏆</div>

                    <div className="score-details-text">
                      <p className="score-title">
                        {winner.prizeCategory === "five-number"
                          ? "5-Number Prize"
                          : winner.prizeCategory === "four-number"
                            ? "4-Number Prize"
                            : "3-Number Prize"}
                      </p>

                      <p className="score-date">
                        {winner.draw?.drawMonth || "Draw"}
                        {" • "}
                        {winner.matchCount} matches
                      </p>
                    </div>
                  </div>

                  <div className="score-value-pill">£{winner.prizeAmount}</div>

                  <div className="score-actions">
                    <span
                      className={
                        winner.verificationStatus === "approved"
                          ? "btn-success"
                          : winner.verificationStatus === "rejected"
                            ? "btn-danger"
                            : "btn-secondary"
                      }
                    >
                      {winner.verificationStatus === "approved"
                        ? "Verified ✓"
                        : winner.verificationStatus === "rejected"
                          ? "Rejected"
                          : "Verification Pending"}
                    </span>

                    <span
                      className={
                        winner.payoutStatus === "paid"
                          ? "btn-success"
                          : "btn-secondary"
                      }
                    >
                      {winner.payoutStatus === "paid"
                        ? "Paid ✓"
                        : "Payment Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
