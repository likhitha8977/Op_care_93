const mongoose = require("mongoose");
require("dotenv").config();

async function testConnection() {
  try {
    console.log("Testing MongoDB connection...");
    console.log("Connection string:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 30000, // 30 seconds
    });

    console.log("✅ MongoDB connected successfully!");

    // Test creating a collection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(
      "📚 Available collections:",
      collections.map((c) => c.name)
    );

    // Close connection
    await mongoose.disconnect();
    console.log("🔌 Connection closed");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

testConnection();
