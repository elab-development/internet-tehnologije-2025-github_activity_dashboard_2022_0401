import request from "supertest";
import { app } from "../packages/index";

beforeAll(() => {
  process.env.GITHUB_TOKEN = "test-token";

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            repository: {
              stargazerCount: 100,
              forkCount: 50,
              defaultBranchRef: {
                target: {
                  history: {
                    totalCount: 25,
                  },
                },
              },
            },
          },
        }),
    } as any)
  );
});

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

