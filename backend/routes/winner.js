import express from "express";
import jwt from "jsonwebtoken";

import Draw from "../models/Draw.js";
import Score from "../models/score.js";
import Winner from "../models/Winner.js";
import upload from "../config/multer.js";
import protectAdmin from "../middleware/admin.js";

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
    console.error("JWT ERROR:", error.name, error.message);

    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

router.post("/check/:drawId", async (req, res) => {
  try {
    const { drawId } = req.params;

    const draw = await Draw.findOne({
      _id: drawId,
      status: "published",
    });

    if (!draw) {
      return res.status(404).json({
        message: "Published draw not found.",
      });
    }

    const scores = await Score.find().sort({
      user: 1,
      playedAt: -1,
    });

    const userScores = {};

    scores.forEach((score) => {
      const userId = score.user.toString();

      if (!userScores[userId]) {
        userScores[userId] = [];
      }

      if (userScores[userId].length < 5) {
        userScores[userId].push(score.stablefordScore);
      }
    });

    const winners = [];

    for (const userId of Object.keys(userScores)) {
      const userNumbers = userScores[userId];

      let matchCount = 0;

      userNumbers.forEach((number) => {
        if (draw.numbers.includes(number)) {
          matchCount++;
        }
      });

      if (matchCount >= 3) {
        let prizeCategory;
        let prizeAmount;

        if (matchCount === 5) {
          prizeCategory = "five-number";
          prizeAmount = draw.fiveNumberPrize;
        } else if (matchCount === 4) {
          prizeCategory = "four-number";
          prizeAmount = draw.fourNumberPrize;
        } else {
          prizeCategory = "three-number";
          prizeAmount = draw.threeNumberPrize;
        }

        winners.push({
          user: userId,
          draw: draw._id,
          matchCount,
          prizeCategory,
          prizeAmount,
        });
      }
    }

    // Separate winners by category
    const fiveWinners = winners.filter((winner) => winner.matchCount === 5);

    const fourWinners = winners.filter((winner) => winner.matchCount === 4);

    const threeWinners = winners.filter((winner) => winner.matchCount === 3);

    fiveWinners.forEach((winner) => {
      winner.prizeAmount = draw.fiveNumberPrize / fiveWinners.length;
    });

    fourWinners.forEach((winner) => {
      winner.prizeAmount = draw.fourNumberPrize / fourWinners.length;
    });

    threeWinners.forEach((winner) => {
      winner.prizeAmount = draw.threeNumberPrize / threeWinners.length;
    });

    if (fiveWinners.length === 0) {
      draw.jackpotRolledOver = true;

      draw.jackpotAmount = (draw.jackpotAmount || 0) + draw.fiveNumberPrize;
    } else {
      draw.jackpotRolledOver = false;
    }

    await draw.save();

    // Remove old winner records for this draw
    await Winner.deleteMany({
      draw: draw._id,
    });

    // Save new winners
    if (winners.length > 0) {
      await Winner.insertMany(winners);
    }

    res.status(200).json({
      message: "Winner matching completed successfully.",
      totalWinners: winners.length,
      fiveNumberWinners: fiveWinners.length,
      fourNumberWinners: fourWinners.length,
      threeNumberWinners: threeWinners.length,
      winners,
      jackpotRolledOver: draw.jackpotRolledOver,
      jackpotAmount: draw.jackpotAmount,
    });
  } catch (error) {
    console.error("Winner matching error:", error.message);

    res.status(500).json({
      message: "Unable to check winners.",
    });
  }
});

router.get("/my-winnings", protect, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid user information. Please log in again.",
      });
    }

    const winners = await Winner.find({
      user: userId,
    })
      .populate("draw", "drawMonth drawDate numbers")
      .sort({ createdAt: -1 });

    res.status(200).json(winners);
  } catch (error) {
    console.error("Fetch my winnings error:", error.message);

    res.status(500).json({
      message: "Unable to fetch your winnings.",
    });
  }
});

router.post(
  "/:winnerId/upload-screenshot",
  protect,
  upload.single("screenshot"),
  async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;

      if (!userId) {
        return res.status(401).json({
          message: "Invalid user information. Please log in again.",
        });
      }

      // Find winner record belonging to logged-in user
      const winner = await Winner.findOne({
        _id: req.params.winnerId,
        user: userId,
      });

      if (!winner) {
        return res.status(404).json({
          message: "Winner record not found.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a screenshot.",
        });
      }

      if (winner.verificationStatus === "approved") {
        return res.status(400).json({
          message: "This winning record has already been approved.",
        });
      }

      winner.screenshotUrl = `/uploads/${req.file.filename}`;
      winner.verificationStatus = "pending";

      await winner.save();

      res.status(200).json({
        message: "Screenshot uploaded successfully.",
        winner,
      });
    } catch (error) {
      console.error("Screenshot upload error:", error.message);

      res.status(500).json({
        message: "Unable to upload screenshot.",
      });
    }
  },
);

router.get("/admin/pending", protectAdmin, async (req, res) => {
  try {
    const winners = await Winner.find({
      verificationStatus: "pending",
    })
      .populate("user", "name email")
      .populate("draw", "drawMonth drawDate numbers")
      .sort({ createdAt: -1 });

    res.status(200).json(winners);
  } catch (error) {
    console.error("Fetch pending winners error:", error.message);

    res.status(500).json({
      message: "Unable to fetch pending winners.",
    });
  }
});

router.put("/admin/:winnerId/review", protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either approved or rejected.",
      });
    }

    const winner = await Winner.findById(req.params.winnerId);

    if (!winner) {
      return res.status(404).json({
        message: "Winner record not found.",
      });
    }

    if (!winner.screenshotUrl) {
      return res.status(400).json({
        message: "This winner has not uploaded a screenshot yet.",
      });
    }

    winner.verificationStatus = status;

    await winner.save();

    res.status(200).json({
      message: `Winner verification ${status}.`,
      winner,
    });
  } catch (error) {
    console.error("Winner review error:", error.message);

    res.status(500).json({
      message: "Unable to review winner.",
    });
  }
});

router.put("/admin/:winnerId/mark-paid", protectAdmin, async (req, res) => {
  try {
    const winner = await Winner.findById(req.params.winnerId);

    if (!winner) {
      return res.status(404).json({
        message: "Winner record not found.",
      });
    }

    if (winner.verificationStatus !== "approved") {
      return res.status(400).json({
        message: "Only approved winners can be marked as paid.",
      });
    }

    if (winner.payoutStatus === "paid") {
      return res.status(400).json({
        message: "This winner has already been marked as paid.",
      });
    }

    winner.payoutStatus = "paid";

    await winner.save();

    res.status(200).json({
      message: "Winner payout marked as paid.",
      winner,
    });
  } catch (error) {
    console.error("Mark winner paid error:", error.message);

    res.status(500).json({
      message: "Unable to update winner payout status.",
    });
  }
});

router.get("/:drawId", async (req, res) => {
  try {
    const winners = await Winner.find({
      draw: req.params.drawId,
    })
      .populate("user", "name email")
      .populate("draw");

    res.status(200).json(winners);
  } catch (error) {
    console.error("Fetch winners error:", error.message);

    res.status(500).json({
      message: "Unable to fetch winners.",
    });
  }
});

export default router;
