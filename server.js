const express = require("express");
const app = express();

const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("Welcome");
})

app.listen(3000,(req, res)=>{
    console.log("Running on port 3000");
});