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

app.post("/register", async(req, res)=>{
    const {firstname, lastname, email, password} = req.body;
    await pool.query("Insert INTO users(firstname, lastname, email, password) values ($1, $2, $3, $4)",
        [firstname, lastname, email, password])
        res.json({message: "Registered"})
});

app.post("/login", async (req, res)=>{
    const {email, password} = req.body;
    const user = await pool.query("Select * from users where email = $1", [email]);
    if(user.rows.length === 0)
            return res.status(400).send("User not found");

    const token = jwt.sign({email: email}, process.env.SECRET_KEY);
    res.json({message: "Login Success",token: token});
});

app.listen(3000, (req, res)=>{
    console.log("Server Is Running");
})