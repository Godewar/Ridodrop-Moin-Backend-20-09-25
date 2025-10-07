const User = require("../models/User");
const jwt = require("jsonwebtoken");
const path = require("path");

exports.getProfile = async (req, res) => {
  try {
    // req.user is already the complete user object from auth middleware
    console.log('User profile:', req.user);
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, lname, phone, gender, role } = req.body;

    // Check if user already exists by phone
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this phone already exists" });
    }

    // Upload image as public URL
    let profilePhoto;
    if (req.file) {
      const filePath = req.file.path.replace(/\\/g, "/"); // normalize Windows paths
      profilePhoto = `${req.protocol}://${req.get("host")}/${filePath}`;
    }

    // Generate unique customerId and referralCode
    const customerId = `CUST${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const referralCode = `REF${Date.now()}${Math.floor(Math.random() * 10000)}`;

    const newUser = new User({
      name,
      lname,
      // Email field removed to avoid database index issues
      phone,
      gender,
      role,
      profilePhoto,
      customerId,
      referralCode,
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(token);
    res.status(201).json({
      message: "User created successfully",
      token,
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
