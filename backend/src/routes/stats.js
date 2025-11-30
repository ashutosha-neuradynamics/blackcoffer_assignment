const express = require("express");
const Insight = require("../models/Insight");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const byYear = await Insight.aggregate([
      {
        $match: {
          end_year: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$end_year",
          avgIntensity: { $avg: "$intensity" },
          avgLikelihood: { $avg: "$likelihood" },
          avgRelevance: { $avg: "$relevance" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const byCountry = await Insight.aggregate([
      {
        $match: {
          country: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$country",
          avgIntensity: { $avg: "$intensity" },
          avgLikelihood: { $avg: "$likelihood" },
          avgRelevance: { $avg: "$relevance" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    const bySector = await Insight.aggregate([
      {
        $match: {
          sector: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$sector",
          avgIntensity: { $avg: "$intensity" },
          avgLikelihood: { $avg: "$likelihood" },
          avgRelevance: { $avg: "$relevance" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      byYear,
      byCountry,
      bySector,
    });
  } catch (err) {
    console.error("Error in GET /api/stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


