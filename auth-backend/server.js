const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

require("dotenv").config({ path: "../.env" });
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome");
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token" });
  }
  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "No user" });
    req.user = user;
    next();
  });
};

app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salthash = 10;
    const hashedpassword = await bcrypt.hash(password, salthash);

    await pool.query(
      "INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4)",
      [firstname, lastname, email, hashedpassword],
    );

    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const ExisitingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (ExisitingUser.rows.length === 0) {
      return res.status(400).send("User not found");
    }

    const isMatch = await bcrypt.compare(
      password,
      ExisitingUser.rows[0].password,
    );

    if (!isMatch) {
      return res.status(401).send("Invalid password");
    }
    currentUser = ExisitingUser;

    const token = jwt.sign({ email: email }, process.env.SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login Success", token: token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/edit-profile", verifyToken, async (req, res) => {
  try {
    if (req.body.firstname) {
      const { firstname, lastname, email } = req.body;

      const emailFromToken = req.user.email;

      if (!firstname || !lastname || !email) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [emailFromToken],
      );
      if (existingUser.rows.length == 0) {
        return res.status(400).json({ message: "User do not exists" });
      }

      await pool.query(
        "UPDATE users SET firstname = $1, lastname = $2, email = $3 WHERE email = $4",
        [firstname, lastname, email, emailFromToken],
      );
    } else {
      const { email, currentpassword, newpassword } = req.body;

      const emailFromToken = req.user.email;
      if (!email || !currentpassword || !newpassword)
        return res.status(402).send("Bad Request");

      if (email.toLowerCase() !== emailFromToken.toLowerCase()) {
        return res.status(403).send("Email does not match the logged-in user");
      }

      const ExisitingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [emailFromToken],
      );

      if (ExisitingUser.rows.length === 0) {
        return res.status(400).send("User not found");
      }

      const isMatch = await bcrypt.compare(
        currentpassword,
        ExisitingUser.rows[0].password,
      );

      if (!isMatch) return res.status(400).send("User Not Found");
      const compareNew = await bcrypt.compare(
        newpassword,
        ExisitingUser.rows[0].password,
      );

      const salthash = 10;
      const hashedpassword = await bcrypt.hash(newpassword, salthash);

      if (compareNew)
        return res.status(405).send("New Password is same as Current");

      await pool.query(
        "UPDATE users SET email = $2, password=$1 WHERE email = $2",
        [hashedpassword, emailFromToken],
      );
    }
    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3000, (req, res) => {
  console.log("Server Is Running");
});
