"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut, Scatter } from "react-chartjs-2";
import styles from "./page.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

type Insight = {
  _id: string;
  end_year: number | null;
  intensity: number | null;
  likelihood: number | null;
  relevance: number | null;
  sector: string | null;
  topic: string | null;
  region: string | null;
  country: string | null;
  pestle: string | null;
  source: string | null;
};

type Filters = {
  end_year?: string;
  topic?: string;
  sector?: string;
  region?: string;
  pestle?: string;
  source?: string;
  country?: string;
  intensityMin?: string;
  intensityMax?: string;
  likelihoodMin?: string;
  likelihoodMax?: string;
  relevanceMin?: string;
  relevanceMax?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function DashboardPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>(
    {}
  );
  const [items, setItems] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [regionData, setRegionData] = useState<any[]>([]);
  const [pestleData, setPestleData] = useState<any[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/filters`)
      .then((res) => setFilterOptions(res.data))
      .catch((err) => {
        console.error("Failed to load filter options", err);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("limit", "1000");

    setLoading(true);
    Promise.all([
      axios
        .get(`${API_BASE}/api/data?${params.toString()}`)
        .then((res) => setItems(res.data.items))
        .catch((err) => {
          console.error("Failed to load data", err);
        }),
      axios
        .get(`${API_BASE}/api/visualizations/country-distribution?${params.toString()}`)
        .then((res) => setCountryData(res.data))
        .catch((err) => console.error("Failed to load country data", err)),
      axios
        .get(`${API_BASE}/api/visualizations/region-distribution?${params.toString()}`)
        .then((res) => setRegionData(res.data))
        .catch((err) => console.error("Failed to load region data", err)),
      axios
        .get(`${API_BASE}/api/visualizations/pestle-distribution?${params.toString()}`)
        .then((res) => setPestleData(res.data))
        .catch((err) => console.error("Failed to load pestle data", err)),
      axios
        .get(`${API_BASE}/api/visualizations/intensity-likelihood-scatter?${params.toString()}`)
        .then((res) => setScatterData(res.data))
        .catch((err) => console.error("Failed to load scatter data", err)),
    ]).finally(() => setLoading(false));
  }, [filters]);

  const stats = useMemo(() => {
    const total = items.length;
    const avgIntensity =
      items.reduce((sum, item) => sum + (item.intensity || 0), 0) / total || 0;
    const avgLikelihood =
      items.reduce((sum, item) => sum + (item.likelihood || 0), 0) / total || 0;
    const avgRelevance =
      items.reduce((sum, item) => sum + (item.relevance || 0), 0) / total || 0;
    return { total, avgIntensity, avgLikelihood, avgRelevance };
  }, [items]);

  const byYear = useMemo(() => {
    const map = new Map<
      number,
      { intensitySum: number; likelihoodSum: number; relevanceSum: number; count: number }
    >();
    items.forEach((item) => {
      if (item.end_year == null) return;
      const current =
        map.get(item.end_year) || {
          intensitySum: 0,
          likelihoodSum: 0,
          relevanceSum: 0,
          count: 0,
        };
      current.count += 1;
      if (item.intensity != null) current.intensitySum += item.intensity;
      if (item.likelihood != null) current.likelihoodSum += item.likelihood;
      if (item.relevance != null) current.relevanceSum += item.relevance;
      map.set(item.end_year, current);
    });

    const years = Array.from(map.keys()).sort((a, b) => a - b);
    const avgIntensity = years.map(
      (year) => map.get(year)!.intensitySum / map.get(year)!.count
    );
    const avgLikelihood = years.map(
      (year) => map.get(year)!.likelihoodSum / map.get(year)!.count
    );
    const avgRelevance = years.map(
      (year) => map.get(year)!.relevanceSum / map.get(year)!.count
    );

    return { years, avgIntensity, avgLikelihood, avgRelevance };
  }, [items]);

  const intensityBySector = useMemo(() => {
    const map = new Map<string, { intensitySum: number; count: number }>();
    items.forEach((item) => {
      if (!item.sector || item.intensity == null) return;
      const current = map.get(item.sector) || { intensitySum: 0, count: 0 };
      current.intensitySum += item.intensity;
      current.count += 1;
      map.set(item.sector, current);
    });
    const sectors = Array.from(map.keys()).slice(0, 15);
    const avgIntensity = sectors.map(
      (sector) => map.get(sector)!.intensitySum / map.get(sector)!.count
    );
    return { sectors, avgIntensity };
  }, [items]);

  const relevanceByTopic = useMemo(() => {
    const map = new Map<string, { relevanceSum: number; count: number }>();
    items.forEach((item) => {
      if (!item.topic || item.relevance == null) return;
      const current = map.get(item.topic) || { relevanceSum: 0, count: 0 };
      current.relevanceSum += item.relevance;
      current.count += 1;
      map.set(item.topic, current);
    });
    const topics = Array.from(map.keys())
      .sort((a, b) => (map.get(b)?.relevanceSum || 0) - (map.get(a)?.relevanceSum || 0))
      .slice(0, 15);
    const avgRelevance = topics.map(
      (topic) => map.get(topic)!.relevanceSum / map.get(topic)!.count
    );
    return { topics, avgRelevance };
  }, [items]);

  const intensityRange = useMemo(() => {
    const values = items.map((i) => i.intensity).filter((v) => v != null) as number[];
    return { min: Math.min(...values, 0), max: Math.max(...values, 100) };
  }, [items]);

  const likelihoodRange = useMemo(() => {
    const values = items.map((i) => i.likelihood).filter((v) => v != null) as number[];
    return { min: Math.min(...values, 0), max: Math.max(...values, 5) };
  }, [items]);

  const relevanceRange = useMemo(() => {
    const values = items.map((i) => i.relevance).filter((v) => v != null) as number[];
    return { min: Math.min(...values, 0), max: Math.max(...values, 5) };
  }, [items]);

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const scatterChartData = useMemo(() => {
    return {
      datasets: [
        {
          label: "Intensity vs Likelihood",
          data: scatterData.map((item) => ({
            x: item.intensity,
            y: item.likelihood,
          })),
          backgroundColor: "rgba(99, 102, 241, 0.5)",
          borderColor: "rgba(99, 102, 241, 1)",
        },
      ],
    };
  }, [scatterData]);

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <h2>Filters</h2>

        <div className={styles.filter}>
          <span>Intensity Range</span>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min={intensityRange.min}
              max={intensityRange.max}
              value={filters.intensityMin || intensityRange.min}
              onChange={(e) =>
                handleFilterChange("intensityMin", e.target.value)
              }
            />
            <span className={styles.rangeValue}>
              {filters.intensityMin || intensityRange.min} - {filters.intensityMax || intensityRange.max}
            </span>
          </div>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min={intensityRange.min}
              max={intensityRange.max}
              value={filters.intensityMax || intensityRange.max}
              onChange={(e) =>
                handleFilterChange("intensityMax", e.target.value)
              }
            />
          </div>
        </div>

        <div className={styles.filter}>
          <span>Likelihood Range</span>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min={likelihoodRange.min}
              max={likelihoodRange.max}
              value={filters.likelihoodMin || likelihoodRange.min}
              onChange={(e) =>
                handleFilterChange("likelihoodMin", e.target.value)
              }
            />
            <span className={styles.rangeValue}>
              {filters.likelihoodMin || likelihoodRange.min} - {filters.likelihoodMax || likelihoodRange.max}
            </span>
          </div>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min={likelihoodRange.min}
              max={likelihoodRange.max}
              value={filters.likelihoodMax || likelihoodRange.max}
              onChange={(e) =>
                handleFilterChange("likelihoodMax", e.target.value)
              }
            />
          </div>
        </div>

        <div className={styles.filter}>
          <span>Relevance Range</span>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min={relevanceRange.min}
              max={relevanceRange.max}
              value={filters.relevanceMin || relevanceRange.min}
              onChange={(e) =>
                handleFilterChange("relevanceMin", e.target.value)
              }
            />
            <span className={styles.rangeValue}>
              {filters.relevanceMin || relevanceRange.min} - {filters.relevanceMax || relevanceRange.max}
            </span>
          </div>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min={relevanceRange.min}
              max={relevanceRange.max}
              value={filters.relevanceMax || relevanceRange.max}
              onChange={(e) =>
                handleFilterChange("relevanceMax", e.target.value)
              }
            />
          </div>
        </div>

        <label className={styles.filter}>
          <span>End Year</span>
          <select
            value={filters.end_year || ""}
            onChange={(e) => handleFilterChange("end_year", e.target.value)}
          >
            <option value="">All</option>
            {filterOptions.end_year?.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filter}>
          <span>Topic</span>
          <select
            value={filters.topic || ""}
            onChange={(e) => handleFilterChange("topic", e.target.value)}
          >
            <option value="">All</option>
            {filterOptions.topic?.slice(0, 50).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filter}>
          <span>Sector</span>
          <select
            value={filters.sector || ""}
            onChange={(e) => handleFilterChange("sector", e.target.value)}
          >
            <option value="">All</option>
            {filterOptions.sector?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filter}>
          <span>Region</span>
          <select
            value={filters.region || ""}
            onChange={(e) => handleFilterChange("region", e.target.value)}
          >
            <option value="">All</option>
            {filterOptions.region?.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filter}>
          <span>PESTLE</span>
          <select
            value={filters.pestle || ""}
            onChange={(e) => handleFilterChange("pestle", e.target.value)}
          >
            <option value="">All</option>
            {filterOptions.pestle?.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filter}>
          <span>Source</span>
          <select
            value={filters.source || ""}
            onChange={(e) => handleFilterChange("source", e.target.value)}
          >
            <option value="">All</option>
            {filterOptions.source?.slice(0, 30).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filter}>
          <span>Country</span>
          <select
            value={filters.country || ""}
            onChange={(e) => handleFilterChange("country", e.target.value)}
          >
            <option value="">All</option>
            {filterOptions.country?.slice(0, 50).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <button className={styles.clearFilters} onClick={clearFilters}>
          Clear All Filters
        </button>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Blackcoffer Insights Dashboard</h1>
          <div className={styles.stats}>
            {loading ? (
              <span className={styles.loading}>Loading...</span>
            ) : (
              <span className={styles.statBadge}>{stats.total} records</span>
            )}
          </div>
        </header>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statCardLabel}>Total Records</div>
            <div className={styles.statCardValue}>{stats.total.toLocaleString()}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardLabel}>Avg Intensity</div>
            <div className={styles.statCardValue}>{stats.avgIntensity.toFixed(1)}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardLabel}>Avg Likelihood</div>
            <div className={styles.statCardValue}>{stats.avgLikelihood.toFixed(2)}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardLabel}>Avg Relevance</div>
            <div className={styles.statCardValue}>{stats.avgRelevance.toFixed(2)}</div>
          </div>
        </div>

        <section className={styles.chartsGrid}>
          <div className={styles.card}>
            <h3>Average Metrics by End Year</h3>
            <div className={styles.chartContainer}>
              {byYear.years.length ? (
                <Line
                  data={{
                    labels: byYear.years,
                    datasets: [
                      {
                        label: "Intensity",
                        data: byYear.avgIntensity,
                        borderColor: "#6366f1",
                        backgroundColor: "rgba(99, 102, 241, 0.2)",
                        tension: 0.4,
                      },
                      {
                        label: "Likelihood",
                        data: byYear.avgLikelihood,
                        borderColor: "#22c55e",
                        backgroundColor: "rgba(34, 197, 94, 0.2)",
                        tension: 0.4,
                      },
                      {
                        label: "Relevance",
                        data: byYear.avgRelevance,
                        borderColor: "#f97316",
                        backgroundColor: "rgba(249, 115, 22, 0.2)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" as const },
                    },
                  }}
                />
              ) : (
                <div className={styles.emptyState}>No data for selected filters.</div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h3>Average Intensity by Sector</h3>
            <div className={styles.chartContainer}>
              {intensityBySector.sectors.length ? (
                <Bar
                  data={{
                    labels: intensityBySector.sectors,
                    datasets: [
                      {
                        label: "Intensity",
                        data: intensityBySector.avgIntensity,
                        backgroundColor: "rgba(59, 130, 246, 0.6)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y" as const,
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              ) : (
                <div className={styles.emptyState}>No data for selected filters.</div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h3>Average Relevance by Topic (Top 15)</h3>
            <div className={styles.chartContainer}>
              {relevanceByTopic.topics.length ? (
                <Bar
                  data={{
                    labels: relevanceByTopic.topics,
                    datasets: [
                      {
                        label: "Relevance",
                        data: relevanceByTopic.avgRelevance,
                        backgroundColor: "rgba(16, 185, 129, 0.7)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              ) : (
                <div className={styles.emptyState}>No data for selected filters.</div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h3>Country Distribution (Top 20)</h3>
            <div className={styles.chartContainer}>
              {countryData.length ? (
                <Bar
                  data={{
                    labels: countryData.map((d) => d._id),
                    datasets: [
                      {
                        label: "Count",
                        data: countryData.map((d) => d.count),
                        backgroundColor: "rgba(139, 92, 246, 0.6)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              ) : (
                <div className={styles.emptyState}>No data for selected filters.</div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h3>Region Distribution</h3>
            <div className={styles.chartContainer}>
              {regionData.length ? (
                <Doughnut
                  data={{
                    labels: regionData.map((d) => d._id),
                    datasets: [
                      {
                        data: regionData.map((d) => d.count),
                        backgroundColor: [
                          "#6366f1",
                          "#8b5cf6",
                          "#ec4899",
                          "#f43f5e",
                          "#ef4444",
                          "#f97316",
                          "#f59e0b",
                          "#eab308",
                          "#84cc16",
                          "#22c55e",
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "right" as const },
                    },
                  }}
                />
              ) : (
                <div className={styles.emptyState}>No data for selected filters.</div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h3>PESTLE Distribution</h3>
            <div className={styles.chartContainer}>
              {pestleData.length ? (
                <Doughnut
                  data={{
                    labels: pestleData.map((d) => d._id),
                    datasets: [
                      {
                        data: pestleData.map((d) => d.count),
                        backgroundColor: [
                          "#3b82f6",
                          "#8b5cf6",
                          "#ec4899",
                          "#f43f5e",
                          "#ef4444",
                          "#f97316",
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "right" as const },
                    },
                  }}
                />
              ) : (
                <div className={styles.emptyState}>No data for selected filters.</div>
              )}
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardFull}`}>
            <h3>Intensity vs Likelihood Scatter</h3>
            <div className={styles.chartContainerLarge}>
              {scatterData.length ? (
                <Scatter
                  data={scatterChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Intensity",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Likelihood",
                        },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              ) : (
                <div className={styles.emptyState}>No data for selected filters.</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
