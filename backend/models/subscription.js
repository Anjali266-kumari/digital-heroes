import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "lapsed"],
      default: "inactive",
    },

    startDate: {
      type: Date,
      default: null,
    },

    renewalDate: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    paymentProvider: {
      type: String,
      default: "stripe",
    },

    paymentCustomerId: {
      type: String,
      default: null,
    },

    paymentSubscriptionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
