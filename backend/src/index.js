const app = require("./app");
const { connectToDatabase } = require("./config/db");

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { start };


