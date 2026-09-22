import jwt from "jsonwebtoken";
import Subscription from "../models/subscription.js";

const protectSubscriber = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    const userId = req.user.userId || req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
    });

    if (!subscription) {
      return res.status(403).json({
        message: "An active subscription is required to access this feature.",
      });
    }

    // Check whether subscription has expired
    if (
      subscription.status === "active" &&
      subscription.renewalDate &&
      new Date() >= new Date(subscription.renewalDate)
    ) {
      subscription.status = "lapsed";
      await subscription.save();
    }

    if (subscription.status !== "active") {
      return res.status(403).json({
        message:
          "Your subscription is not active. Please subscribe to continue.",
      });
    }

    req.subscription = subscription;

    next();
  } catch (error) {
    console.error("Subscription protection error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired login session. Please log in again.",
    });
  }
};

export default protectSubscriber;
