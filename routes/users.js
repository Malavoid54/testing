const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');

// signup
router.post('/signup', async (req, res) => {
  const { Username, Password } = req.body;

  if (!Username || !Password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM Users WHERE Username = ?', [Username]);
    if (rows.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    await db.execute('INSERT INTO Users (Username, Password) VALUES (?, ?)', [Username, hashedPassword]);

    res.status(201).json({ Username });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// login
router.post('/login', async (req, res) => {
  const { Username, Password } = req.body;

  if (!Username || !Password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM Users WHERE Username = ?', [Username]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.json({
      UserID: user.UserID,
      Username: user.Username
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

