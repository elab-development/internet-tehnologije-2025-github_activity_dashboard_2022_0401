import request from "supertest";
import app from "../packages/index";

describe("Basic API Test", () => {
  it("should return 404 for unknown route", async () => {
    const res = await request(app).get("/random-route");
    expect(res.status).toBe(404);
  });
});

it("should return 200 on /health", async () => {
  const res = await request(app).get("/health");

  expect(res.status).toBe(200);
  expect(res.body.status).toBe("ok");
});

it("should call github stats endpoint", async () => {
  const res = await request(app).get("/github/vercel/next.js/stats");

  expect(res.status).toBe(200);
});

