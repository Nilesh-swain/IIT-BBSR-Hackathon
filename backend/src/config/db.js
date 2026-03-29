const connectDB = async () => {
  try {
    // Adding these options ensures the driver doesn't get stuck in a DNS loop
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4, 
    });
    console.log("📡 Astraea Database Linked Successfully");
  } catch (error) {
    console.error("❌ Connection Failure!");
    console.error(`Reason: ${error.message}`);
    console.log("💡 Tip: Check if your IP is whitelisted at 0.0.0.0/0 in Atlas.");
  }
};