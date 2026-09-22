import express from "express";
import Charity from "../models/Charity.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

router.get("/", async (req, res) => {
  try {
    const charities = await Charity.find({
      isActive: true,
    }).sort({
      name: 1,
    });

    res.status(200).json(charities);
  } catch (error) {
    console.error("Fetch charities error:", error.message);

    res.status(500).json({
      message: "Unable to fetch charities.",
    });
  }
});

router.get("/selected", protect, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const user = await User.findById(userId)
      .select("-passwordHash")
      .populate("selectedCharity");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      selectedCharity: user.selectedCharity || null,
      charityContribution: user.charityContribution || 10,
    });
  } catch (error) {
    console.error("Fetch selected charity error:", error.message);

    res.status(500).json({
      message: "Unable to fetch selected charity.",
    });
  }
});

router.put("/select", protect, async (req, res) => {
  try {
    const { charityId } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Invalid user information. Please log in again.",
      });
    }

    if (!mongoose.isValidObjectId(charityId)) {
      return res.status(400).json({
        message: "Please provide a valid charity ID.",
      });
    }

    const charity = await Charity.findOne({
      _id: charityId,
      isActive: true,
    });

    if (!charity) {
      return res.status(404).json({
        message: "Charity not found or is currently unavailable.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        selectedCharity: charity._id,
      },
      {
        new: true,
      },
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      message: "Charity selected successfully!",
      selectedCharity: charity,
    });
  } catch (error) {
    console.error("Select charity error:", error.message);

    res.status(500).json({
      message: "Unable to select charity.",
    });
  }
});

router.put("/contribution", protect, async (req, res) => {
  try {
    const { contribution } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Invalid user information. Please log in again.",
      });
    }

    if (
      contribution === undefined ||
      typeof contribution !== "number" ||
      contribution < 10 ||
      contribution > 100
    ) {
      return res.status(400).json({
        message: "Contribution must be between 10% and 100%.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        charityContribution: contribution,
      },
      {
        new: true,
      },
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      message: "Charity contribution updated successfully!",
      charityContribution: user.charityContribution,
    });
  } catch (error) {
    console.error("Update charity contribution error:", error.message);

    res.status(500).json({
      message: "Unable to update charity contribution.",
    });
  }
});

export default router;
