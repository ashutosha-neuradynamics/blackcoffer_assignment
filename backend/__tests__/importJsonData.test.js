const fs = require("fs");

jest.mock("fs");

const importJsonData = require("../src/scripts/importJsonData");

describe("importJsonData", () => {
  let mockModel;

  beforeEach(() => {
    mockModel = {
      insertMany: jest.fn().mockResolvedValue([{ _id: "1" }, { _id: "2" }]),
    };
  });

  it("reads JSON file, transforms records, and calls insertMany on the model", async () => {
    const sampleData = [
      {
        end_year: "2025",
        intensity: 6,
        sector: "Energy",
        topic: "gas",
        insight: "Sample insight",
        url: "http://example.com",
        region: "World",
        start_year: "",
        impact: "",
        added: "January, 20 2017 03:51:25",
        published: "January, 09 2017 00:00:00",
        country: "United States of America",
        relevance: 2,
        pestle: "Economic",
        source: "EIA",
        title: "Sample title",
        likelihood: 3,
      },
      {
        end_year: "",
        intensity: 0,
        sector: "",
        topic: "",
        insight: "",
        url: "",
        region: "",
        start_year: "",
        impact: "",
        added: "",
        published: "",
        country: "",
        relevance: null,
        pestle: "",
        source: "",
        title: "",
        likelihood: null,
      },
    ];

    fs.readFileSync.mockReturnValue(JSON.stringify(sampleData));

    const result = await importJsonData({
      filePath: "dummy-path.json",
      Model: mockModel,
    });

    expect(fs.readFileSync).toHaveBeenCalledWith("dummy-path.json", "utf-8");
    expect(mockModel.insertMany).toHaveBeenCalledTimes(1);

    const insertedDocs = mockModel.insertMany.mock.calls[0][0];
    expect(insertedDocs).toHaveLength(2);

    expect(insertedDocs[0]).toMatchObject({
      end_year: 2025,
      intensity: 6,
      sector: "Energy",
      topic: "gas",
      region: "World",
      country: "United States of America",
      relevance: 2,
      pestle: "Economic",
      source: "EIA",
      likelihood: 3,
    });

    // Empty strings should become null where appropriate
    expect(insertedDocs[1].end_year).toBeNull();

    expect(result.insertedCount).toBe(2);
  });
});


