import express from "express";
import mongoose from "mongoose";
import Draw from "../models/Draw.js";
import Score from "../models/score.js";
import protectAdmin from "../middleware/admin.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const draws = await Draw.find().sort({
      drawDate: -1,
    });

    res.status(200).json(draws);
  } catch (error) {
    console.error("Fetch draws error:", error.message);

    res.status(500).json({
      message: "Unable to fetch draws.",
    });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const draw = await Draw.findOne({
      status: "published",
    }).sort({
      drawDate: -1,
    });

    if (!draw) {
      return res.status(404).json({
        message: "No published draw available.",
      });
    }

    res.status(200).json(draw);
  } catch (error) {
    console.error("Fetch latest draw error:", error.message);

    res.status(500).json({
      message: "Unable to fetch latest draw.",
    });
  }
});

router.post("/generate", async (req, res) => {
  try {
    // Get all scores
    const scores = await Score.find().sort({
      playedAt: -1,
    });

    if (scores.length === 0) {
      return res.status(400).json({
        message: "No Stableford scores are available to generate a draw.",
      });
    }

    const frequency = {};

    scores.forEach((score) => {
      const number = score.stablefordScore;

      frequency[number] = (frequency[number] || 0) + 1;
    });

    const weightedNumbers = [];

    Object.entries(frequency).forEach(([number, count]) => {
      for (let i = 0; i < count; i++) {
        weightedNumbers.push(Number(number));
      }
    });

    const selectedNumbers = [];

    while (
      selectedNumbers.length < 5 &&
      selectedNumbers.length < Object.keys(frequency).length
    ) {
      const randomIndex = Math.floor(Math.random() * weightedNumbers.length);

      const number = weightedNumbers[randomIndex];

      if (!selectedNumbers.includes(number)) {
        selectedNumbers.push(number);
      }
    }

    while (selectedNumbers.length < 5) {
      const randomNumber = Math.floor(Math.random() * 45) + 1;

      if (!selectedNumbers.includes(randomNumber)) {
        selectedNumbers.push(randomNumber);
      }
    }

    selectedNumbers.sort((a, b) => a - b);

    const now = new Date();

    const drawMonth = now.toLocaleString("en-GB", {
      month: "long",
      year: "numeric",
    });

    const draw = await Draw.create({
      drawMonth,
      drawDate: now,
      numbers: selectedNumbers,
      status: "simulation",
      jackpotAmount: 0,
      jackpotRolledOver: false,
    });

    res.status(201).json({
      message: "Draw generated successfully.",
      draw,
    });
  } catch (error) {
    console.error("Generate draw error:", error.message);

    res.status(500).json({
      message: "Unable to generate draw.",
    });
  }
});

router.post("/:drawId/publish", protectAdmin, async (req, res) => {
  try {
    const { drawId } = req.params;

    if (!mongoose.isValidObjectId(drawId)) {
      return res.status(400).json({
        message: "Invalid draw ID.",
      });
    }

    const draw = await Draw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        message: "Draw not found.",
      });
    }

    if (draw.status === "published") {
      return res.status(400).json({
        message: "This draw is already published.",
      });
    }

    draw.status = "published";

    await draw.save();

    res.status(200).json({
      message: "Draw published successfully.",
      draw,
    });
  } catch (error) {
    console.error("Publish draw error:", error.message);

    res.status(500).json({
      message: "Unable to publish draw.",
    });
  }
});

router.post("/:drawId/prize-pool", protectAdmin, async (req, res) => {
  try {
    const { drawId } = req.params;
    const { prizePool } = req.body;

    if (!mongoose.isValidObjectId(drawId)) {
      return res.status(400).json({
        message: "Invalid draw ID.",
      });
    }

    if (
      prizePool === undefined ||
      typeof prizePool !== "number" ||
      prizePool < 0
    ) {
      return res.status(400).json({
        message:
          "Prize pool must be a valid number greater than or equal to 0.",
      });
    }

    const draw = await Draw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        message: "Draw not found.",
      });
    }

    draw.prizePool = prizePool;

    draw.fiveNumberPrize = prizePool * 0.4;
    draw.fourNumberPrize = prizePool * 0.35;
    draw.threeNumberPrize = prizePool * 0.25;

    await draw.save();

    res.status(200).json({
      message: "Prize pool calculated successfully.",
      draw,
    });
  } catch (error) {
    console.error("Prize pool calculation error:", error.message);

    res.status(500).json({
      message: "Unable to calculate prize pool.",
    });
  }
});

export default router;
