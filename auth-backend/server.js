const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { log } = require("@angular-devkit/build-angular/src/builders/ssr-dev-server");

require("dotenv").config({ path: "../.env" });
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg format allowed!')
            err.name = 'ExtensionError'
            return cb(err);
        }
    },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ 
  storage: storage
});

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
    const user_id = ExisitingUser.rows[0].id;
    res.json({
      message: "Login Success",
      token: token,
      img_pth: image_path,
      name: userName,
      email: email,
      user_id:user_id
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
      if (req.body.currentpassword) {
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

        if (confirmpassword != newpassword)
          return res.status(405).send("Password not same as newpassword");

        const salthash = 10;
        const hashedpassword = await bcrypt.hash(newpassword, salthash);

        await pool.query("UPDATE users SET password=$1 WHERE email = $2", [
          hashedpassword,
          emailFromToken,
        ]);
        return res.json({ message: "Password updated successfully" });
      } else {
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

app.post("/brand_details", upload.single("image"), async (req, res) => {
  try {
    const { brandName } = req.body;
    let imagePath = req.file ? req.file.filename : null;
    if (!brandName || imagePath == null)
      return res.status(303).json({ message: "Data Required" });
    const has = pool.query("select * from brands where brandName = $1", [
      brandName,
    ]);
    if (has.rows > 0)
      return res.status(303).json({ message: "This brand already exists" });

    await pool.query(
      "INSERT INTO brands (brand_name, brand_logo) values ($1, $2)",
      [brandName, imagePath],
    );

    res.status(200).json({
      message: "Success",
      data: brandName,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

app.post("/car_details/:user_id", upload.array("image", 250), async (req, res) => {
  try {
    const {user_id} = req.params;
    const userID = parseInt(user_id, 10)
    const {
      brandName,
      modelName,
      category,
      engineType,
      horsePower,
      torque,
      topSpeed,
      price,
      description,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    let imagePaths = req.files.map(file=>file.filename);

    if (
      !userID ||
      !brandName ||
      !modelName ||
      !category ||
      !engineType ||
      !horsePower ||
      !torque ||
      !topSpeed ||
      !price ||
      !description
    ) {
      return res.status(400).json({ message: "All Details Required" });
    }

    const cleanHP = parseInt(horsePower.toString().replace(/,/g, ""), 10);
    const cleanTorque = parseInt(torque.toString().replace(/,/g, ""), 10);
    const cleanTopSpeed = parseInt(topSpeed.toString().replace(/,/g, ""), 10);
    const cleanPrice = parseFloat(price.toString().replace(/[$,]/g, ""));

    const brandRes = await pool.query(
      "SELECT brand_id FROM brands WHERE brand_name = $1",
      [brandName],
    );
    if (brandRes.rows.length === 0) {
      return res.status(404).json({ message: "Brand not found" });
    }
    const brand_id = brandRes.rows[0].brand_id;

    const exists = await pool.query(
      "SELECT * FROM cars WHERE brand_id = $1 AND model_name = $2 AND category = $3",
      [brand_id, modelName, category],
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Already exists" });
    }

    const newCar = await pool.query(
      "INSERT INTO cars (brand_id, user_id, model_name, category, car_logo) VALUES ($1, $2, $3, $4, $5) RETURNING car_id",
      [brand_id, user_id, modelName, category, imagePaths],
    );

    const car_id = newCar.rows[0].car_id;

    await pool.query(
      "INSERT INTO car_details (car_id, engine_type, horsepower, torque, top_speed, price, description) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        car_id,
        engineType,
        cleanHP,
        cleanTorque,
        cleanTopSpeed,
        cleanPrice,
        description,
      ],
    );

    res.status(200).json({ message: "Car details added successfully" });
  } catch (err) {
    console.error("Database Error:", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

app.get("/brands", async (req, res) => {
  try {
    const brands = await pool.query("select * from brands");
    return res.status(200).json(brands.rows || brands);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err });
  }
});

app.get("/brands/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params; 
    const userID = parseInt(user_id, 10);

    if (isNaN(userID)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const query = `
      SELECT * FROM brands 
      WHERE brand_id IN (
        SELECT DISTINCT brand_id FROM cars WHERE user_id = $1
      )
    `;
    
    const brands = await pool.query(query, [userID]);

    // 3. Return only the rows array
    return res.status(200).json(brands.rows);

  } catch (err) {
    console.error("Database Error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/cars/:id/:user_id", async (req, res) => {
  try {
    const { id, user_id } = req.params;
    const userID = parseInt(user_id, 10);
    const brandId = parseInt(id, 10);
    const query = `
      SELECT 
        c.car_id AS car_id, 
        c.model_name, 
        c.category, 
        c.car_logo,
        cd.price, 
        cd.description, 
        cd.engine_type, 
        cd.horsepower, 
        cd.torque, 
        cd.top_speed
      FROM cars c 
      JOIN car_details cd ON c.car_id = cd.car_id 
      WHERE c.brand_id = $1 and c.user_id = $2
    `;

    const cars = await pool.query(query, [brandId, userID]);

    return res.status(200).set('Content-Type', 'application/json').json(cars.rows);
  } catch (err) {
    console.error("SQL Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/brands/search/:name/:user_id", async (req, res) => {
  try {
    const { name, user_id } = req.params;
    const userID = parseInt(user_id, 10);
    console.log(req);
    

    if (!name) {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const brands = await pool.query(
      "SELECT * FROM brands WHERE brand_id in(select distinct (brand_id) form cars where user_id = $1) brand_name ILIKE $2",
      [userID, `%${name}%`]
    );

    return res.status(200).json(brands.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/cars/search/:id/:name/:category/:engine/:user_id", async(req, res)=>{
  try{
    const {id, name, category, engine, user_id} = req.params;
    const ID = parseInt(id, 10);
    const userID = parseInt(user_id, 10);
    const SQLQuery = (`
      SELECT 
        c.car_id AS car_id, 
        c.model_name, 
        c.category, 
        c.car_logo,
        cd.price, 
        cd.description, 
        cd.engine_type, 
        cd.horsepower, 
        cd.torque, 
        cd.top_speed
      FROM cars c 
      JOIN car_details cd ON c.car_id = cd.car_id where (c.model_name ILIKE $1 OR $1 = 'all' ) and(c.category ILIKE $2 OR $2 = 'all') and (cd.engine_type ILIKE $3 or $3='all') and c.brand_id = $4 and c.user_id = $5
    `);

    const values = [
      name==='none'?'all':`%${name}%`,
      category==='none'?'all':`%${category}%`,
      engine==='none'?'all':`%${engine}%`,
      ID, 
      userID
    ]

    const result = await pool.query(SQLQuery, values);
    return res.status(200).json(result.rows);
  }
  catch(err){
    console.log(err);
    
  }
})

app.get("/allcars/:user_id", async(req, res)=>{
  try{
    const {user_id} = req.params;
    if(!user_id) return res.status(405).json({message: "No user_id to get all cars"})
    const cars = await pool.query(`SELECT 
        c.car_id AS car_id, 
        c.model_name, 
        c.category, 
        c.car_logo,
        cd.price, 
        cd.description, 
        cd.engine_type, 
        cd.horsepower, 
        cd.torque, 
        cd.top_speed
      FROM cars c 
      JOIN car_details cd ON c.car_id = cd.car_id where c.user_id = $1
    `, [user_id])
    return res.status(200).json(cars.rows);
  }
catch(err){
  console.log(err);
}
})


app.get("/cars_images/:id/:user_id", async(req, res)=>{
  try{
    const {id, user_id} = req.params;
    if(!id || !user_id) return res.status(405).json({message:"Either id or usrid not there for all images"})
    const allImages = await pool.query(
        "select car_logo from cars where car_id=$1 and user_id=$2", [id, user_id]
      )
    return res.status(200).json(allImages.rows);
  }
catch(err){
  console.log(err);
  
}
})

app.listen(3000, (req, res) => {
  console.log("Server Is Running");
});

