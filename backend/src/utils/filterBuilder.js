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
      const rangeFilter = {};
      if (min !== undefined) rangeFilter.$gte = min;
      if (max !== undefined) rangeFilter.$lte = max;
      if (Object.keys(rangeFilter).length > 0) {
        filter[field] = rangeFilter;
      }
    }
  });

  return filter;
}

module.exports = { buildFilter, parseNumber };

