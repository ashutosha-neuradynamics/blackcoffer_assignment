const fs = require("fs");

function toNullableNumber(value) {
  if (value === null || value === undefined) return null;
  if (value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

async function importJsonData({ filePath, Model }) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);

  const documents = parsed.map((item) => ({
    end_year: toNullableNumber(item.end_year),
    intensity: toNullableNumber(item.intensity),
    sector: item.sector || null,
    topic: item.topic || null,
    insight: item.insight || null,
    url: item.url || null,
    region: item.region || null,
    start_year: toNullableNumber(item.start_year),
    impact: toNullableNumber(item.impact),
    added: item.added || null,
    published: item.published || null,
    country: item.country || null,
    relevance: toNullableNumber(item.relevance),
    pestle: item.pestle || null,
    source: item.source || null,
    title: item.title || null,
    likelihood: toNullableNumber(item.likelihood),
  }));

  const BATCH_SIZE = 1000;
  let totalInserted = 0;

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    const inserted = await Model.insertMany(batch, { ordered: false });
    totalInserted += inserted.length;
    console.log(`Inserted batch: ${totalInserted}/${documents.length} records`);
  }

  return {
    insertedCount: totalInserted,
  };
}

module.exports = importJsonData;


