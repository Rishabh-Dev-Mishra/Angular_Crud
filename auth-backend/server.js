const express = require("express")
const app = express()
const cors = require("cors")
const pool = require("./db")

app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("Welcome");
})

app.listen(3000, (req, res)=>{
    console.log("Server Is Running");
})