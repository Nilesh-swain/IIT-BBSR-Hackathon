import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const Watchlist = mongoose.model(
      "Watchlist",
      new mongoose.Schema(
        {
          user: mongoose.Schema.Types.ObjectId,
          asteroidId: String,
          name: String,
          asteroidData: Object,
        },
        { timestamps: true },
      ),
    );

    const orphanedCount = await Watchlist.countDocuments({
      user: { $exists: false },
    });
    console.log("Orphaned documents (no user field):", orphanedCount);

    const totalCount = await Watchlist.countDocuments();
    console.log("Total watchlist documents:", totalCount);

    if (orphanedCount > 0) {
      console.log("Found orphaned documents! These need to be cleaned up.");
      const orphaned = await Watchlist.find({ user: { $exists: false } }).limit(
        5,
      );
      console.log(
        "Sample orphaned documents:",
        JSON.stringify(orphaned, null, 2),
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

connectDB();
