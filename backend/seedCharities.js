import mongoose from "mongoose";
import Charity from "./models/Charity.js";
import dotenv from "dotenv";

dotenv.config();

const charities = [
  {
    name: "Education for All",
    description:
      "Supporting education and learning opportunities for children.",
    image: "",
    website: "",
  },
  {
    name: "Green Earth Foundation",
    description:
      "Working to protect the environment and promote sustainability.",
    image: "",
    website: "",
  },
  {
    name: "Helping Hands",
    description:
      "Providing support and essential resources to communities in need.",
    image: "",
    website: "",
  },
  {
    name: "Hope for Children",
    description: "Supporting children's health, education, and wellbeing.",
    image: "",
    website: "",
  },
];

const seedCharities = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    // Remove existing charity records
    await Charity.deleteMany({});

    // Insert sample charities
    await Charity.insertMany(charities);

    console.log("Charities added successfully!");

    await mongoose.connection.close();
    console.log("MongoDB connection closed.");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding charities:", error.message);
    process.exit(1);
  }
};

seedCharities();
