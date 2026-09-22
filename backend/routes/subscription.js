import express from "express";
import jwt from "jsonwebtoken";
import Subscription from "../models/subscription.js";

const router = express.Router();

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Not authorized. Please log in.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    let subscription = await Subscription.findOne({
      user: userId,
    });

    if (!subscription) {
      return res.status(200).json({
        subscription: null,
        message: "No subscription found.",
      });
    }

    if (
      subscription.status === "active" &&
      subscription.renewalDate &&
      new Date() >= new Date(subscription.renewalDate)
    ) {
      subscription.status = "lapsed";

      await subscription.save();
    }

    res.status(200).json({
      subscription,
    });
  } catch (error) {
    console.error("Get subscription error:", error.message);

    res.status(500).json({
      message: "Server error while fetching subscription.",
    });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { plan } = req.body;

    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({
        message: "Please select a valid subscription plan.",
      });
    }

    const startDate = new Date();
    const renewalDate = new Date(startDate);

    if (plan === "monthly") {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    const subscription = await Subscription.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        plan,
        status: "active",
        startDate,
        renewalDate,
        cancelledAt: null,
      },
      {
        upsert: true,
        new: true,
      },
    );

    res.status(200).json({
      message: "Subscription activated successfully!",
      subscription,
    });
  } catch (error) {
    console.error("Create subscription error:", error.message);

    res.status(500).json({
      message: "Server error while creating subscription.",
    });
  }
});

router.put("/cancel", protect, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
    });

    if (!subscription) {
      return res.status(404).json({
        message: "No subscription found.",
      });
    }

    if (subscription.status !== "active") {
      return res.status(400).json({
        message: "Only an active subscription can be cancelled.",
      });
    }

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();

    await subscription.save();

    res.status(200).json({
      message: "Subscription cancelled successfully.",
      subscription,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error.message);

    res.status(500).json({
      message: "Server error while cancelling subscription.",
    });
  }
});

export default router;
