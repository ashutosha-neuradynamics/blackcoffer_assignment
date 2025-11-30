const mongoose = require("mongoose");

const InsightSchema = new mongoose.Schema(
  {
    end_year: Number,
    intensity: Number,
    sector: String,
    topic: String,
    insight: String,
    url: String,
    region: String,
    start_year: Number,
    impact: Number,
    added: String,
    published: String,
    country: String,
    relevance: Number,
    pestle: String,
    source: String,
    title: String,
    likelihood: Number,
  },
  { timestamps: false }
);

const Insight = mongoose.models.Insight || mongoose.model("Insight", InsightSchema);

module.exports = Insight;


