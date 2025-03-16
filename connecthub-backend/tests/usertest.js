const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/user");

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User API", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/users/register").send({
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should login an existing user", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "testuser@example.com",
      password: "password123",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
