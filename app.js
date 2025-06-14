const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = 3000;

const db = new sqlite3.Database("./db/feedback.db", (err) => {
  if (err) return console.error(err.message);
  console.log("Connected to SQLite DB");
});

// Create tables
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  message TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function (err) {
    if (err) return res.status(400).json({ error: "Username already exists" });
    res.json({ message: "Registered successfully", id: this.lastID });
  });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) {
      res.json({ message: "Login success", userId: user.id });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

// Submit feedback
app.post("/submit", (req, res) => {
  const { userId, message } = req.body;
  db.run(`INSERT INTO feedback (user_id, message) VALUES (?, ?)`, [userId, message], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message });
  });
});

// Get feedbacks
app.get("/feedbacks", (req, res) => {
  db.all(`SELECT f.id, u.username, f.message FROM feedback f JOIN users u ON f.user_id = u.id ORDER BY f.id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
