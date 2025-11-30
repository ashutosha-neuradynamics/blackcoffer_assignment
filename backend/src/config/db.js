const mongoose = require("mongoose");

const DEFAULT_URI = "mongodb://localhost:27017/blackcoffer_dashboard";

async function connectToDatabase(uri = process.env.MONGODB_URI || DEFAULT_URI) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  return mongoose.connection;
}

module.exports = {
  connectToDatabase,
  DEFAULT_URI,
};


