const express = require("express");
const cors = require("cors");

const { connectToDatabase } = require("./config/db");
const dataRoutes = require("./routes/data");
const filterRoutes = require("./routes/filters");
const statsRoutes = require("./routes/stats");
const visualizationRoutes = require("./routes/visualizations");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

app.use("/api/data", dataRoutes);
app.use("/api/filters", filterRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/visualizations", visualizationRoutes);

module.exports = app;


