import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const cleanupOrphanedWatchlist = async () => {
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

    // Count orphaned documents
    const orphanedCount = await Watchlist.countDocuments({
      user: { $exists: false },
    });

    console.log(`Found ${orphanedCount} orphaned watchlist documents`);

    if (orphanedCount > 0) {
      // Show sample before deletion
      const samples = await Watchlist.find({ user: { $exists: false } }).limit(
        3,
      );
      console.log(
        "Sample orphaned documents:",
        JSON.stringify(samples, null, 2),
      );

      // Delete orphaned documents
      const deleteResult = await Watchlist.deleteMany({
        user: { $exists: false },
      });

      console.log(`Deleted ${deleteResult.deletedCount} orphaned documents`);
    }

    // Verify all remaining documents have user field
    const remainingOrphaned = await Watchlist.countDocuments({
      user: { $exists: false },
    });

    console.log(`Remaining orphaned documents: ${remainingOrphaned}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

cleanupOrphanedWatchlist();
