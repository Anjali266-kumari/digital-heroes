import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id;

    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Admin protection error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired login session.",
    });
  }
};

export default protectAdmin;
