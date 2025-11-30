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
      if (min !== undefined) filter[field].min = min;
      if (max !== undefined) filter[field].max = max;
    }
  });

  Object.entries(filter).forEach(([key, value]) => {
    if (value && value.min !== undefined) {
      filter[key].$gte = value.min;
      delete filter[key].min;
    }
    if (value && value.max !== undefined) {
      filter[key].$lte = value.max;
      delete filter[key].max;
    }
    if (value && !Object.keys(value).length) {
      delete filter[key];
    }
  });

  return filter;
}

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = buildFilter(req.query);

    const [items, total] = await Promise.all([
      Insight.find(filter).skip(skip).limit(limit).lean(),
      Insight.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("Error in GET /api/data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


