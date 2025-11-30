const path = require("path");
const mongoose = require("mongoose");
const { connectToDatabase } = require("../config/db");
const Insight = require("../models/Insight");
const importJsonData = require("./importJsonData");

async function main() {
  try {
    await connectToDatabase();

    const jsonPath =
      process.argv[2] ||
      path.resolve(__dirname, "../../../jsondata.json");

    console.log("Importing data from:", jsonPath);

    await Insight.deleteMany({});

    const result = await importJsonData({
      filePath: jsonPath,
      Model: Insight,
    });

    console.log(`Imported ${result.insertedCount} records`);
  } catch (err) {
    console.error("Import failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main();
}


