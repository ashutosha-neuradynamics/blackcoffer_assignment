const express = require("express");
const Insight = require("../models/Insight");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const fields = [
      "end_year",
      "topic",
      "sector",
      "region",
      "pestle",
      "source",
      "country",
    ];

    const result = {};

    await Promise.all(
      fields.map(async (field) => {
        const values = await Insight.distinct(field, { [field]: { $ne: null } });
        result[field] = values
          .filter((v) => v !== "" && v !== null && v !== undefined)
          .sort();
      })
    );

    res.json(result);
  } catch (err) {
    console.error("Error in GET /api/filters:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


