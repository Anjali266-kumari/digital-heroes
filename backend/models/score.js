import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    stablefordScore: {
      type: Number,
      required: true,
      min: 1,
      max: 45,
    },

    playedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Score = mongoose.model("Score", scoreSchema);

export default Score;
