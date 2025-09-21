const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "swetha2212",
  database: "user_db"
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Connected to MySQL Database!");
});

// Register route
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
    (err, result) => {
      if (err) return res.send("❌ Error: " + err.message);
      res.send("✅ User registered successfully!");
    }
  );
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.send("❌ Error: " + err.message);
    if (results.length === 0) return res.send("❌ User not found!");

    const isMatch = await bcrypt.compare(password, results[0].password);
    if (!isMatch) return res.send("❌ Invalid credentials!");

    res.send(`✅ Welcome ${results[0].name}!`);
  });
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});

