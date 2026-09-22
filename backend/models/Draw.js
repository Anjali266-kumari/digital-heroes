import mongoose from "mongoose";

const drawSchema = new mongoose.Schema(
  {
    drawMonth: {
      type: String,
      required: true,
    },

    drawDate: {
      type: Date,
      required: true,
    },

    numbers: {
      type: [Number],
      required: true,
      validate: {
        validator: function (numbers) {
          return numbers.length === 5;
        },
        message: "A draw must contain exactly 5 numbers.",
      },
    },

    status: {
      type: String,
      enum: ["simulation", "published"],
      default: "simulation",
    },

    prizePool: {
      type: Number,
      default: 0,
      min: 0,
    },

    fiveNumberPrize: {
      type: Number,
      default: 0,
      min: 0,
    },

    fourNumberPrize: {
      type: Number,
      default: 0,
      min: 0,
    },

    threeNumberPrize: {
      type: Number,
      default: 0,
      min: 0,
    },

    jackpotAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    jackpotRolledOver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Draw = mongoose.models.Draw || mongoose.model("Draw", drawSchema);

export default Draw;
