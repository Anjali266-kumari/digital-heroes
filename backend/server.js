import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import scoreRoutes from "./routes/score.js";
import subscriptionRoutes from "./routes/subscription.js";
import charityRoutes from "./routes/Charity.js";
import drawRoutes from "./routes/draw.js";
import winnerRoutes from "./routes/winner.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/winners", winnerRoutes);

app.get("/", (req, res) => {
  res.send("Digital Heroes API is running!");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
