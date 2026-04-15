const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const multer = require("multer");

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
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

app.use((req, res, next) => {
  console.log("➡️ API HIT:", req.method, req.url);
  next();
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILID,
    pass: process.env.MAILPASSWORD,
  },
});

const sendMail = async (userEmail, token, id) => {
  const resetUrl = `http://localhost:4200/forgotPassword/${token}/${id}`;

  const mailOptions = {
    from: '"Car Gallery" <rishumishra3899@gmail.com>',
    to: userEmail,
    subject: "Reset Password Request",
    html: `
            <p>You requested a password reset.</p>
            <p>Click the link below to set a new password. This link expires in 15 minutes:</p>
            <a href="${resetUrl}">${resetUrl}</a>
        `,
  };
  return transporter.sendMail(mailOptions);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error("Only .png, .jpg and .jpeg format allowed!");
      err.name = "ExtensionError";
      return cb(err);
    }
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage: storage,
});

app.get("/", (req, res) => {
  res.send("Welcome");
});

// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ message: "No token" });
//   }
//   jwt.verify(token, process.env.SECRET, (err, user) => {
//     if (err) return res.status(401).json({ message: "No user" });
//     req.user = user;
//     next();
//   });
// };

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
      return res.status(400).json({ message: "Email Already Taken" });
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
    await pool.query("update users set status=$1 where id = $2", [
      "Active",
      user_id,
    ]);
    res.json({
      message: "Login Success",
      token: token,
      img_pth: image_path,
      name: userName,
      email: email,
      user_id: user_id,
      role: ExisitingUser.rows[0].role,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/userInfo/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res
        .status(500)
        .json({ message: "user_id not found for retrieving information" });
    }

    const cleanUserId = parseInt(user_id, 10);
    // console.log(cleanUserId);

    const user = await pool.query("select * from users where id=$1", [
      cleanUserId,
    ]);
    // console.log(user);

    return res.status(200).json(user.rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.post("/edit-profile", upload.single("image"), async (req, res) => {
  try {
    if (req.body.currentpassword) {
      const { confirmpassword, currentpassword, newpassword, user_id } =
        req.body;

      if (!confirmpassword || !currentpassword || !newpassword || !user_id)
        return res.status(402).send("Bad Request");

      const cleanUserId = parseInt(user_id, 10);

      const ExisitingUser = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [cleanUserId],
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

      await pool.query("UPDATE users SET password=$1 WHERE id = $2", [
        hashedpassword,
        cleanUserId,
      ]);
      await pool.query("update users set updated_at = $1 where id = $2", [
        new Date(),
        cleanUserId,
      ]);
      return res.json({ message: "Password updated successfully" });
    } else {
      const { firstname, lastname, email, user_id } = req.body;

      let newImagePath = req.file ? req.file.filename : null;

      if (!firstname || !lastname || !email || !user_id) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const cleanUserId = parseInt(user_id, 10);

      const existingUser = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [cleanUserId],
      );

      const exsistingemail = await pool.query(
        "select * from users where email=$1 and id <> $2",
        [email, cleanUserId],
      );

      if (existingUser.rows.length == 0) {
        return res.status(400).json({ message: "User does not exist" });
      }

      if (exsistingemail.rows.length > 0) {
        return res.status(400).json({ message: "This email is already taken" });
      }

      if (newImagePath) {
        await pool.query(
          "UPDATE users SET firstname = $1, lastname = $2, email = $3, image_path = $4 WHERE id = $5",
          [firstname, lastname, email, newImagePath, cleanUserId],
        );
      } else {
        await pool.query(
          "UPDATE users SET firstname = $1, lastname = $2, email = $3 WHERE id = $4",
          [firstname, lastname, email, cleanUserId],
        );
      }

      await pool.query("update users set updated_at = NOW() where id = $1", [
        cleanUserId,
      ]);

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
});

app.get("/mailCheck/:mail/:user_id", async (req, res) => {
  try {
    const { mail, user_id } = req.params;
    console.log(req.params);

    if (!user_id) return res.status(500).json({ message: "No mail id" });
    console.log(user_id);

    const cleanId = parseInt(user_id, 10);
    if (isNaN(cleanId)) {
      console.log("❌ Invalid user_id:", user_id);
      return res.status(400).json({ message: "Invalid user_id" });
    }
    const exsist = await pool.query(
      "Select * from users where email ILIKE $1 and id <> $2",
      [`${mail}%`, cleanId],
    );
    return res.status(200).json(exsist.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
});

app.put("/logout/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status } = req.body;
    const cleanUserId = parseInt(user_id, 10);
    if (isNaN(cleanUserId)) {
      return res.status(400).json({ message: "Invalid user_id" });
    }

    await pool.query("update users set status=$1 where id = $2", [
      status,
      cleanUserId,
    ]);
    return res.status(200).json({ message: "LoggedOut" });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.post("/brand_details", upload.single("image"), async (req, res) => {
  try {
    const { brandName } = req.body;
    let imagePath = req.file ? req.file.filename : null;
    if (!brandName || imagePath == null)
      return res.status(303).json({ message: "Data Required" });
    const has = pool.query("select * from brands where brand_name = $1", [
      brandName,
    ]);
    if (has.rows.length > 0)
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

app.post(
  "/car_details/:user_id",
  upload.array("image", 250),
  async (req, res) => {
    try {
      const { user_id } = req.params;
      const userID = parseInt(user_id, 10);
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
        return res
          .status(400)
          .json({ message: "At least one image is required" });
      }

      let imagePaths = req.files.map((file) => file.filename);

      if (
        !userID ||
        !brandName ||
        !modelName ||
        !category ||
        !engineType ||
        !horsePower
      ) {
        return res.status(400).json({ message: "All Details Required" });
      }

      const toNum = (val) => {
        if (val === "null" || val === "" || val === undefined) return null;
        return parseFloat(val);
      };

      const cleanHP = parseInt(horsePower.toString().replace(/,/g, ""), 10);
      const cleanTorque = toNum(torque);
      const cleanTopSpeed = toNum(topSpeed);
      const cleanPrice = toNum(price);

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
  },
);

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

app.get("/cars/:id/:user_id/:limit/:offset", async (req, res) => {
  try {
    const { id, user_id, limit, offset } = req.params;
    const userID = parseInt(user_id, 10);
    const brandId = parseInt(id, 10);
    const cleanLimit = parseInt(limit, 10);
    const cleanOffset = parseInt(offset, 10);
    const query = `SELECT 
        b.brand_name,
        c.car_id AS car_id, 
        c.brand_id,
        c.model_name, 
        c.category, 
        c.car_logo,
        cd.price, 
        cd.description, 
        cd.engine_type, 
        cd.horsepower, 
        cd.torque, 
        cd.top_speed
      FROM cars c join brands b on b.brand_id = c.brand_id
      JOIN car_details cd ON c.car_id = cd.car_id 
      WHERE c.brand_id = $1 and c.user_id = $2 and c.deleted_at is null order by b.brand_name, c.model_name limit $3 offset $4`;
    const cars = await pool.query(query, [
      brandId,
      userID,
      cleanLimit,
      cleanOffset,
    ]);

    return res
      .status(200)
      .set("Content-Type", "application/json")
      .json(cars.rows);
  } catch (err) {
    console.error("SQL Error:", err.message);
    return res.status(500).json({ error: err.message });
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
      WHERE c.brand_id = $1 and c.user_id = $2 and c.deleted_at is null
    `;
    const cars = await pool.query(query, [brandId, userID]);

    return res
      .status(200)
      .set("Content-Type", "application/json")
      .json(cars.rows);
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
      "SELECT * FROM brands WHERE brand_id in(select distinct (brand_id) from cars where user_id = $1) and brand_name ILIKE $2",
      [userID, `%${name}%`],
    );

    return res.status(200).json(brands.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get(
  "/cars/search/:id/:name/:category/:engine/:user_id",
  async (req, res) => {
    try {
      const { id, name, category, engine, user_id } = req.params;
      const ID = parseInt(id, 10);
      const userID = parseInt(user_id, 10);
      const SQLQuery = `
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
      JOIN car_details cd ON c.car_id = cd.car_id where (c.model_name ILIKE $1 OR $1 = 'all' ) and(c.category ILIKE $2 OR $2 = 'all') and (cd.engine_type ILIKE $3 or $3='all') and c.brand_id = $4 and c.user_id = $5 and c.deleted_at is null
    `;

      const values = [
        name === "none" ? "all" : `%${name}%`,
        category === "none" ? "all" : `%${category}%`,
        engine === "none" ? "all" : `%${engine}%`,
        ID,
        userID,
      ];

      const result = await pool.query(SQLQuery, values);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
    }
  },
);

app.get("/allcars/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id)
      return res.status(405).json({ message: "No user_id to get all cars" });
    const cars = await pool.query(
      `SELECT 
        b.brand_name,
        c.car_id AS car_id, 
        c.brand_id,
        c.model_name, 
        c.category, 
        c.car_logo,
        cd.price, 
        cd.description, 
        cd.engine_type, 
        cd.horsepower, 
        cd.torque, 
        cd.top_speed
      FROM cars c join brands b on b.brand_id = c.brand_id
      JOIN car_details cd ON c.car_id = cd.car_id where c.user_id = $1 and c.deleted_at is null
    `,
      [user_id],
    );
    return res.status(200).json(cars.rows);
  } catch (err) {
    console.log(err);
  }
});

app.get("/cars_images/:id/:user_id", async (req, res) => {
  try {
    const { id, user_id } = req.params;
    if (!id || !user_id)
      return res
        .status(405)
        .json({ message: "Either id or usrid not there for all images" });
    const allImages = await pool.query(
      "select car_logo from cars where car_id=$1 and user_id=$2 and cars.deleted_at is null",
      [id, user_id],
    );
    return res.status(200).json(allImages.rows);
  } catch (err) {
    console.log(err);
  }
});

app.delete("/delete_car/:car_id/:user_id", async (req, res) => {
  try {
    const { car_id, user_id } = req.params;
    if (!user_id || !car_id)
      return res
        .status(400)
        .json({ message: "User or car id missing to delete" });

    await pool.query(
      "update cars set deleted_at=$3 where car_id = $1 and user_id = $2",
      [car_id, user_id, new Date()],
    );
    return res.status(200).json({ message: "Success To delete" });
  } catch (err) {
    console.log(err);
  }
});

app.get("/singleCar/:car_id", async (req, res) => {
  try {
    const { car_id } = req.params;
    const car_Id = parseInt(car_id, 10);
    console.log(car_Id);
    const car_detail = await pool.query(
      `
      SELECT
      c.brand_id,
        c.model_name, 
        c.category,
        cd.price, 
        cd.description, 
        cd.engine_type, 
        cd.horsepower, 
        cd.torque, 
        cd.top_speed,
        cd.description
      FROM cars c 
      JOIN car_details cd ON c.car_id = cd.car_id 
      WHERE c.car_id = $1 and c.deleted_at is null
    `,
      [car_Id],
    );
    console.log(car_detail.rows[0].horsepower);

    const brandName = await pool.query(
      "select brand_name from brands where brand_id = $1",
      [car_detail.rows[0].brand_id],
    );
    return res
      .status(200)
      .json({ cars: car_detail.rows[0], brand: brandName.rows[0] });
  } catch (err) {
    console.log(err);
  }
});

app.put("/editCar", upload.array("image", 250), async (req, res) => {
  try {
    console.log("good");
    const {
      car_id,
      brandName,
      modelName,
      category,
      engineType,
      torque,
      topSpeed,
      price,
      horsePower,
      description,
      oldImages,
    } = req.body;

    const carID = parseInt(car_id, 10);
    console.log(car_id);

    const toNum = (val) => {
      if (val === "null" || val === "" || val === undefined) return null;
      return parseFloat(val);
    };

    const cleanTorque = toNum(torque);
    const cleanTopSpeed = toNum(topSpeed);
    const cleanPrice = toNum(price);

    const brandId = await pool.query(
      "select brand_id from brands where brand_name = $1",
      [brandName],
    );
    let keepOld = oldImages ? JSON.parse(oldImages) : [];

    let imagePaths = req.files.map((file) => file.filename);
    imagePaths = [...imagePaths, ...keepOld];
    if (imagePaths && imagePaths.length > 0) {
      await pool.query(
        `update
        cars set brand_id=$1, model_name=$2, category=$3, car_logo=$4 where car_id= $5`,
        [brandId.rows[0].brand_id, modelName, category, imagePaths, carID],
      );
    } else {
      await pool.query(
        `update
        cars set brand_id=$1, model_name=$2, category=$3 where car_id= $4`,
        [brandId.rows[0].brand_id, modelName, category, carID],
      );
    }
    await pool.query(
      `update
        car_details set engine_type=$1, horsepower=$2, torque=$3, top_speed=$4, price=$5, description= $6 where car_id= $7`,
      [
        engineType,
        horsePower,
        cleanTorque,
        cleanTopSpeed,
        cleanPrice,
        description,
        carID,
      ],
    );
    console.log(car_id);

    return res.status(200).json({ message: "Edit Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to update" });
  }
});

//Admin Panel

app.get("/allbrands", async (req, res) => {
  try {
    const brands = await pool.query("Select * from brands");
    return res.status(200).json(brands.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.get("/allCars", async (req, res) => {
  try {
    const cars = await pool.query(
      "select c.*, u.* from cars c join users u on u.id = c.user_id and c.deleted_at is null",
    );
    return res.status(200).json(cars.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.get("/allUsers", async (req, res) => {
  try {
    const users = await pool.query(
      "select * from users where deleted_at is null order by role , updated_at",
    );
    return res.status(200).json(users.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.put("/updateUserRole", async (req, res) => {
  try {
    const { user_id, role } = req.body;
    await pool.query("update users set role=$1 where id = $2", [role, user_id]);
    return res.status(200).json({ message: "updated role" });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.put("/deleteUser/:user_id", async (req, res) => {
  try {
    console.log("Deleting");

    const { user_id } = req.params;
    console.log(user_id);

    if (!user_id) return res.status(500).json({ message: err });
    const cleanUserId = parseInt(user_id, 10);
    await pool.query("update users set deleted_at= NOW() where id = $1", [
      cleanUserId,
    ]);

    return res.status(200).json({ message: "Deletion Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
});

app.post("/createRequest", upload.single("brand_logo"), async (req, res) => {
  try {
    const { brand_name, user_id } = req.body;

    const image_path = req.file ? req.file.filename : null;

    if (!image_path || !brand_name || !user_id)
      return res.status(400).json({ message: err });

    const cleanUserId = parseInt(user_id, 10);

    const exsisting = await pool.query(
      "select * from brands where brand_name=$1",
      [brand_name],
    );

    if (exsisting.rows.length > 0)
      return res.status(400).json({ message: err });
    await pool.query(
      "Insert into requests (user_id, brand_logo, brand_name) values ($1, $2, $3)",
      [cleanUserId, image_path, brand_name],
    );
    return res.status(200).json({ message: "Success request" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err });
  }
});

app.get("/getRequests", async (req, res) => {
  try {
    const requests = await pool.query(
      "select r.*, u.firstname from requests r join users u on u.id = r.user_id where r.status=$1",
      ["pending"],
    );
    return res.status(200).json(requests.rows);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err });
  }
});

app.post("/acceptRequests", async (req, res) => {
  try {
    const { request_id, brand_logo, brand_name } = req.body;
    if (!brand_logo || !brand_name || !request_id)
      return res.status(400).json({ message: "Error fetching request id" });

    const cleanId = parseInt(request_id, 10);

    await pool.query(
      "insert into brands (brand_name, brand_logo) values ($1, $2)",
      [brand_name, brand_logo],
    );

    await pool.query("update requests set status = $1 where request_id=$2", [
      "accepted",
      cleanId,
    ]);
    return res.status(200).json({ message: "Accepted" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err });
  }
});

app.put("/rejectRequests", async (req, res) => {
  try {
    const { request_id } = req.body;
    if (!request_id)
      return res.status(400).json({ message: "Error fetching request id" });
    const cleanId = parseInt(request_id, 10);
    await pool.query("update requests set status = $1 where request_id=$2", [
      "rejected",
      cleanId,
    ]);
    return res.status(200).json({ message: "Rejceted" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err });
  }
});

app.put("/updateUserStatus", async (req, res) => {
  try {
    const { user_id, Update } = req.body;
    if (!user_id)
      return res
        .status(400)
        .json({ message: "error in updating status user id" });

    const cleanId = parseInt(user_id, 10);

    await pool.query("update users set status=$1 where id = $2", [
      Update,
      cleanId,
    ]);
    return res.status(200).json({ message: "Status Update Success", Update });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: `error in updating status` });
  }
});

app.get("/userStatus/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id)
      return res
        .status(400)
        .json({ message: "error in fetching status user id" });

    const cleanId = parseInt(user_id, 10);
    const status = await pool.query("select status from users where id=$1", [
      cleanId,
    ]);
    return res.status(200).json(status.rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: `error fetching the user status` });
  }
});

app.post("/sendMail", async (req, res) => {
  try {
    const { email, data } = req.body;

    if (!email) return res.status(400).json({ message: `error sending mail no email` });

    const user = await pool.query("Select * from users where email=$1", [
      email,
    ]);

    if (user.rows.length == 0)
      return res.status(400).json({ message: `error sending mail no user` });

    const token = jwt.sign({ email: email }, process.env.SECRET, {
      expiresIn: "15m",
    });
    await sendMail(email, token, user.rows[0].id);

    await pool.query(
      "Update users set token_for_password=$1 , token_number=$2 where email=$3",
      [token, user.rows[0].id, email],
    );

    return res.status(200).json({ message: `Mail sent` });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: `error sending mail` });
  }
});

app.get("/validateToken/:token/:id", async (req, res) => {
  try {
    const { token, id } = req.params;
    if (!token || !id)
      return res.status(500).json({ message: "no token" });

    const correct = await pool.query(
      "select token_number from users where token_for_password =$1 and token_number=$2",
      [token, id],
    );

    if (correct.rows.length === 0) {
      return res.status(404).json({ valid: false });
    }

    return res.status(200).json({ valid: true });


  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
});

app.put("/resetPassword/:token_number", async (req, res) => {
  try {
    const { password } = req.body;
    const {token_number} = req.params;

    if (!password)
      return res
        .status(400)
        .json({ message: `error reseting password data missing` });


    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("Update users set password=$1 where token_number=$2", [
      hashedPassword,
      token_number,
    ]);

      await pool.query(
      "Update users set token_for_password=$1, token_number=$2 where token_number=$3",
      [null, null, token_number],
    );


    return res.status(200).json({ message: `Password Reset success` });
  } catch (err) {
    console.log(err);

      await pool.query(
      "Update users set token_for_password=$1, token_number=$2 where token_number=$3",
      [null, null, token_number],
    );

    return res
      .status(400)
      .json({ message: `error reseting password pata nhi` });
  }
});

app.listen(3000, (req, res) => {
  console.log("Server Is Running");
});
