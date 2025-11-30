const express = require("express");
const Insight = require("../models/Insight");

const router = express.Router();

function parseNumber(value) {
  if (value === undefined) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

function buildFilter(query) {
  const filter = {};

  const multiFields = ["topic", "sector", "region", "pestle", "source", "country"];

  multiFields.forEach((field) => {
    const raw = query[field];
    if (raw) {
      const values = String(raw)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      if (values.length) {
        filter[field] = { $in: values };
      }
    }
  });

  if (query.end_year) {
    const endYear = parseNumber(query.end_year);
    if (endYear !== undefined) {
      filter.end_year = endYear;
    }
  }

  const rangeFields = ["intensity", "likelihood", "relevance", "impact"];

  rangeFields.forEach((field) => {
    const min = parseNumber(query[`${field}Min`]);
    const max = parseNumber(query[`${field}Max`]);
    if (min !== undefined || max !== undefined) {
      filter[field] = {};
      if (min !== undefined) filter[field].$gte = min;
      if (max !== undefined) filter[field].$lte = max;
    }
  });

  return filter;
}

router.get("/country-distribution", async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    filter.country = { $ne: null, $ne: "" };

    const result = await Insight.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
          avgIntensity: { $avg: "$intensity" },
          avgLikelihood: { $avg: "$likelihood" },
          avgRelevance: { $avg: "$relevance" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error in country-distribution:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/region-distribution", async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    filter.region = { $ne: null, $ne: "" };

    const result = await Insight.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$region",
          count: { $sum: 1 },
          avgIntensity: { $avg: "$intensity" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error in region-distribution:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pestle-distribution", async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    filter.pestle = { $ne: null, $ne: "" };

    const result = await Insight.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$pestle",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error in pestle-distribution:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/intensity-likelihood-scatter", async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    filter.intensity = { $ne: null };
    filter.likelihood = { $ne: null };

    const result = await Insight.aggregate([
      { $match: filter },
      {
        $project: {
          intensity: 1,
          likelihood: 1,
          relevance: 1,
          sector: 1,
        },
      },
      { $limit: 1000 },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error in intensity-likelihood-scatter:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/topic-sector-heatmap", async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    filter.topic = { $ne: null, $ne: "" };
    filter.sector = { $ne: null, $ne: "" };

    const result = await Insight.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { topic: "$topic", sector: "$sector" },
          count: { $sum: 1 },
          avgRelevance: { $avg: "$relevance" },
        },
      },
      {
        $group: {
          _id: "$_id.topic",
          sectors: {
            $push: {
              sector: "$_id.sector",
              count: "$count",
              avgRelevance: "$avgRelevance",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 15 },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error in topic-sector-heatmap:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;



