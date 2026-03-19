const express = require("express")
const app = express()
const cors = require("cors")
const pool = require("./db")

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

    // Optional: check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Insert new user
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
app.post("/login", async (req, res)=>{
    const {email, password} = req.body;
    const user = await pool.query("Select * from users where email = $1", [email]);
    if(user.rows.length === 0)
            return res.status(400).send("User not found");
    res.json({message: "Login Success"});
});

app.listen(3000, (req, res)=>{
    console.log("Server Is Running");
})