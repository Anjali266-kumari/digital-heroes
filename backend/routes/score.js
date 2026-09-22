import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Score from "../models/score.js";
import protectSubscriber from "../middleware/subscription.js";

const router = express.Router();

// ===============================
// Authentication Middleware
// ===============================
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
    console.error("JWT ERROR:", error.name, error.message);

    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

// ===============================
// POST /api/scores
// Add a new score
// ===============================
router.post("/", protectSubscriber, async (req, res) => {
  try {
    const { stablefordScore, playedAt } = req.body;

    const score = Number(stablefordScore);

    // Validate Stableford score
    if (
      stablefordScore === undefined ||
      stablefordScore === null ||
      stablefordScore === "" ||
      !Number.isInteger(score) ||
      score < 1 ||
      score > 45
    ) {
      return res.status(400).json({
        message: "Stableford score must be a whole number between 1 and 45.",
      });
    }

    // Validate date
    if (!playedAt || Number.isNaN(Date.parse(playedAt))) {
      return res.status(400).json({
        message: "Please provide a valid date for the golf round.",
      });
    }

    const userId = req.user.userId || req.user.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Invalid user information. Please log in again.",
      });
    }

    const playedDate = new Date(playedAt);

    // Start and end of selected date
    const startOfDay = new Date(playedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(playedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // ===============================
    // Check duplicate date
    // ===============================
    const existingScore = await Score.findOne({
      user: userId,
      playedAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingScore) {
      return res.status(400).json({
        message:
          "A score for this date already exists. You can edit or delete the existing score.",
      });
    }

    // ===============================
    // Check current score count
    // ===============================
    const scoreCount = await Score.countDocuments({
      user: userId,
    });

    // If user already has 5 scores,
    // remove the oldest one before adding the new score.
    if (scoreCount >= 5) {
      const oldestScore = await Score.findOne({
        user: userId,
      }).sort({
        playedAt: 1,
      });

      if (oldestScore) {
        await Score.findByIdAndDelete(oldestScore._id);
      }
    }

    // ===============================
    // Create new score
    // ===============================
    const newScore = await Score.create({
      user: userId,
      stablefordScore: score,
      playedAt: playedDate,
    });

    res.status(201).json({
      message: "Golf score submitted successfully!",
      score: newScore,
    });
  } catch (error) {
    console.error("Score submission error:", error.message);

    res.status(500).json({
      message: "Server error while submitting the score.",
    });
  }
});

// ===============================
// GET /api/scores
// Get latest 5 scores
// ===============================
router.get("/", protectSubscriber, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Invalid user information. Please log in again.",
      });
    }

    const scores = await Score.find({
      user: userId,
    })
      .sort({
        playedAt: -1,
      })
      .limit(5);

    res.status(200).json({
      scores,
    });
  } catch (error) {
    console.error("Get scores error:", error.message);

    res.status(500).json({
      message: "Server error while fetching scores.",
    });
  }
});

router.put("/:id", protectSubscriber, async (req, res) => {
  try {
    const { stablefordScore, playedAt } = req.body;

    const score = Number(stablefordScore);

    const userId = req.user.userId || req.user.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Invalid user information. Please log in again.",
      });
    }

    if (
      stablefordScore === undefined ||
      stablefordScore === null ||
      stablefordScore === "" ||
      !Number.isInteger(score) ||
      score < 1 ||
      score > 45
    ) {
      return res.status(400).json({
        message: "Stableford score must be a whole number between 1 and 45.",
      });
    }

    if (!playedAt || Number.isNaN(Date.parse(playedAt))) {
      return res.status(400).json({
        message: "Please provide a valid date for the golf round.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid score ID.",
      });
    }

    const existingScore = await Score.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!existingScore) {
      return res.status(404).json({
        message: "Score not found.",
      });
    }

    const updatedPlayedDate = new Date(playedAt);

    const startOfDay = new Date(updatedPlayedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(updatedPlayedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const duplicateScore = await Score.findOne({
      user: userId,
      _id: { $ne: req.params.id },
      playedAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (duplicateScore) {
      return res.status(400).json({
        message:
          "A score for this date already exists. Please choose another date.",
      });
    }

    existingScore.stablefordScore = score;
    existingScore.playedAt = updatedPlayedDate;

    await existingScore.save();

    res.status(200).json({
      message: "Golf score updated successfully!",
      score: existingScore,
    });
  } catch (error) {
    console.error("Update score error:", error.message);

    res.status(500).json({
      message: "Server error while updating the score.",
    });
  }
});

router.delete("/:id", protectSubscriber, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Invalid user information. Please log in again.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid score ID.",
      });
    }

    // Only allow user to delete their own score
    const score = await Score.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!score) {
      return res.status(404).json({
        message: "Score not found.",
      });
    }

    await Score.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Golf score deleted successfully!",
    });
  } catch (error) {
    console.error("Delete score error:", error.message);

    res.status(500).json({
      message: "Server error while deleting the score.",
    });
  }
});

export default router;
