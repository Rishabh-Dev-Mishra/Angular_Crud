const express = require("express")
const app = express()
const cors = require("cors")
const pool = require("./db")
const jwt = require("jsonwebtoken")

require('dotenv').config(); 
app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("Welcome");
})

app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

   
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    await pool.query(
      "INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4)",
      [firstname, lastname, email, password]
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

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (user.rows.length === 0) {
      return res.status(400).send("User not found");
    }


    if (user.rows[0].password !== password) {
      return res.status(401).send("Invalid password");
    }


    const token = jwt.sign({ email: email }, process.env.SECRET_KEY, { expiresIn: '1h' });
    
    res.json({ message: "Login Success", token: token });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.listen(3000, (req, res)=>{
    console.log("Server Is Running");
})