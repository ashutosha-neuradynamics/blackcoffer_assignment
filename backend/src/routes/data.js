const express = require("express");
const Insight = require("../models/Insight");
const { buildFilter } = require("../utils/filterBuilder");

const router = express.Router();

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


