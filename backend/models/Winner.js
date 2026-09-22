import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    draw: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Draw",
      required: true,
    },

    matchCount: {
      type: Number,
      required: true,
      min: 3,
      max: 5,
    },

    prizeCategory: {
      type: String,
      enum: ["three-number", "four-number", "five-number"],
      required: true,
    },

    prizeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    screenshotUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Winner = mongoose.models.Winner || mongoose.model("Winner", winnerSchema);

export default Winner;
