import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["subscriber", "admin"],
      default: "subscriber",
    },

    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "cancelled"],
      default: "inactive",
    },

    selectedCharity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      default: null,
    },

    charityContribution: {
      type: Number,
      min: 10,
      max: 100,
      default: 10,
    },
  },
  {
    timestamps: true,
  },
);
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
