const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");

require("dotenv").config({ path: "../.env" });
app.use(cors({
  origin: "http://localhost:4200", 
  credentials: true,            
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"] 
}));

app.use(express.json());


app.use("/uploads", express.static("uploads"));



const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage: storage });

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

    const userImage = ExisitingUser.rows[0].image_path;

    const image_path =
      userImage !== null && userImage.length > 0
        ? ExisitingUser.rows[0].image_path
        : "";

    const token = jwt.sign({ email: email }, process.env.SECRET, {
      expiresIn: "1h",
    });
    const userName = ExisitingUser.rows[0].firstname;
    res.json({
      message: "Login Success",
      token: token,
      img_pth: image_path,
      name: userName,
      email: email,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post(
  "/edit-profile",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {

      if(req.body.currentpassword){
        const { confirmpassword, currentpassword, newpassword } = req.body;

        const emailFromToken = req.user.email;
        if (!confirmpassword || !currentpassword || !newpassword)
          return res.status(402).send("Bad Request");


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



        if (compareNew)
          return res.status(405).send("New Password is same as Current");

        if(confirmpassword != newpassword) return res.status(405).send("Password not same as newpassword")

        const salthash = 10;
        const hashedpassword = await bcrypt.hash(newpassword, salthash);


        await pool.query("UPDATE users SET password=$1 WHERE email = $2", [
          hashedpassword,
          emailFromToken,
        ]);
        return res.json({ message: "Password updated successfully" });
      }
      else {
        const emailFromToken = req.user.email;
        const { firstname, lastname, email } = req.body;

        // 1. Get the new filename if a file was uploaded
        let newImagePath = req.file ? req.file.filename : null;

        if (!firstname || !lastname || !email) {
          return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [emailFromToken],
        );
        if (existingUser.rows.length == 0) {
          return res.status(400).json({ message: "User does not exist" });
        }

        if (newImagePath) {
          await pool.query(
            "UPDATE users SET firstname = $1, lastname = $2, email = $3, image_path = $4 WHERE email = $5",
            [firstname, lastname, email, newImagePath, emailFromToken],
          );
        } else {
          await pool.query(
            "UPDATE users SET firstname = $1, lastname = $2, email = $3 WHERE email = $4",
            [firstname, lastname, email, emailFromToken],
          );
        }
        return res.json({
          message: "Profile updated successfully",
          img_pth: newImagePath,
          name: firstname,
          email: email,
        });
      }
    
    } catch (err) {
      console.error("Register error:", err.message);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

app.post("/brand_details", upload.single("image"), async(req, res)=>{
  try{
  const {brandName} = req.body;
  let imagePath = req.file? req.file.filename:null
  if(!brandName || imagePath == null) return res.status(303).json({message: "Data Required"})
  const has = pool.query("select * from brands where brandName = $1", [brandName]);
  if(has.rows > 0) return res.status(303).json({message:"This brnad already exists"})

    await pool.query("INSERT INTO brands (brand_name, brand_logo) values ($1, $2)", [brandName, imagePath]);

  res.status(200).json({ 
    message: "Success", 
    data: brandName 
  });}
  catch(err){
    console.log(err)
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
})

app.post("/car_details", upload.single("image"), async (req, res) => {
  try {
    const { brandName, modelName, category, engineType, horsePower, torque, topSpeed, price, description } = req.body;
    let imagePath = req.file ? req.file.filename : null;

    if (!brandName || !modelName || !category || !engineType || !horsePower || !torque || !topSpeed || !price || !description || !imagePath) {
      return res.status(400).json({ message: "All Details Required" });
    }

    // Clean numeric inputs: Remove commas and currency symbols
    const cleanHP = parseInt(horsePower.toString().replace(/,/g, ''), 10);
    const cleanTorque = parseInt(torque.toString().replace(/,/g, ''), 10);
    const cleanTopSpeed = parseInt(topSpeed.toString().replace(/,/g, ''), 10);
    const cleanPrice = parseFloat(price.toString().replace(/[$,]/g, ''));

    const brandRes = await pool.query("SELECT brand_id FROM brands WHERE brand_name = $1", [brandName]);
    if (brandRes.rows.length === 0) {
      return res.status(404).json({ message: "Brand not found" });
    }
    const brand_id = brandRes.rows[0].brand_id;

    const exists = await pool.query(
      "SELECT * FROM cars WHERE brand_id = $1 AND model_name = $2 AND category = $3",
      [brand_id, modelName, category]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Already exists" });
    }

    const newCar = await pool.query(
      "INSERT INTO cars (brand_id, model_name, category, car_logo) VALUES ($1, $2, $3, $4) RETURNING car_id",
      [brand_id, modelName, category, imagePath]
    );

    const car_id = newCar.rows[0].car_id;

    // Use the 'clean' numeric variables here
    await pool.query(
      "INSERT INTO car_details (car_id, engine_type, horsepower, torque, top_speed, price, description) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [car_id, engineType, cleanHP, cleanTorque, cleanTopSpeed, cleanPrice, description]
    );

    res.status(200).json({ message: "Car details added successfully" });
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});




app.get("/brands", async(req, res)=>{
  try{
    const brands = await pool.query("select * from brands");
    return res.status(200).json(brands.rows ||  brands);
  } catch(err){
    console.log(err);
    return res.status(400).json({message: "Unknown Error"});
  }
})


app.get("/cars/:id/:name", async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Convert string ID to Integer for your DB
    const brandId = parseInt(id, 10);

    // 2. Use LEFT JOIN so cars show even if specs are missing
    // 3. Ensure 'ON' keyword is present
    const query = `
      SELECT 
        c.car_id, c.brand_id, c.model_name, c.category, c.car_logo,
        cd.price, cd.description, cd.engine_type, cd.horsepower, cd.torque, cd.top_speed
      FROM cars c 
      LEFT JOIN car_details cd ON c.car_id = cd.car_id 
      WHERE c.brand_id = $1
    `;
    
    const result = await pool.query(query, [brandId]);
    
    // Log for debugging: This shows in your Node terminal
    console.log(`Brand ID ${brandId} found ${result.rows.length} cars.`);
    
    return res.status(200).json(result.rows);
  } catch (err) {
    // If this runs, it means your SQL query has an error
    console.error("DATABASE ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});






app.listen(3000, (req, res) => {
  console.log("Server Is Running");
});
