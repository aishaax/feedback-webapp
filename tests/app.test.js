
const request = require("supertest");
const express = require("express");
const app = express();
app.use(express.json());

let fakeUsers = [];

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (fakeUsers.find((u) => u.username === username)) return res.status(400).json({ error: "exists" });
  fakeUsers.push({ username, password });
  res.json({ success: true });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const found = fakeUsers.find((u) => u.username === username && u.password === password);
  if (!found) return res.status(401).json({ error: "Invalid" });
  res.json({ message: "Login success", userId: 1 });
});

test("Register user", async () => {
  const res = await request(app).post("/register").send({ username: "test", password: "123" });
  expect(res.statusCode).toBe(200);
});

test("Duplicate registration fails", async () => {
  const res = await request(app).post("/register").send({ username: "test", password: "123" });
  expect(res.statusCode).toBe(400);
});

test("Login success", async () => {
  const res = await request(app).post("/login").send({ username: "test", password: "123" });
  expect(res.statusCode).toBe(200);
});

test("Login fail", async () => {
  const res = await request(app).post("/login").send({ username: "fail", password: "wrong" });
  expect(res.statusCode).toBe(401);
});
