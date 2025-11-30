const request = require("supertest");
const app = require("../src/app");

jest.mock("../src/config/db", () => ({
  connectToDatabase: jest.fn().mockResolvedValue({}),
}));

describe("GET /health", () => {
  it("returns ok when database connection succeeds", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});


