import mongoose from "mongoose";

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected successfully");
  } catch (err) {
    console.log("Database connection failed:", err);
  }
}

main();
export default {}; // not required, but avoids some tooling warnings
