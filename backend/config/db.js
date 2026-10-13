const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    let uri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/ai-exam-prep";

    // Auto-encode '@' in password if user pasted raw '@' in credentials
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.*)@([^@]+)$/);
    if (match) {
      const protocol = match[1];
      const username = match[2];
      const password = match[3];
      const hostAndOptions = match[4];
      if (password.includes("@")) {
        uri = `${protocol}${username}:${encodeURIComponent(password)}@${hostAndOptions}`;
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
