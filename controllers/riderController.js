const Rider = require("../models/RiderSchema");
const jwt = require("jsonwebtoken");

// ...existing code...

exports.createRider = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Use findOne for a single document
    const existingRider = await Rider.findOne({ phone: phone });
    if (existingRider) {
      return res
        .status(400)
        .json({ error: "Rider with this phone number already exists" });
    }

    // Build images object from uploaded files
    const images = {};
    ["BackaadharCard", "FrontaadharCard", "profilePhoto", "panCard"].forEach(
      (field) => {
        if (req.files && req.files[field]) {
          images[field] = req.files[field][0].path.replace(/\\/g, "/"); // Normalize path for consistency
        }
      }
    );

    const riderData = {
      ...req.body,
      images,
    };

    const rider = new Rider(riderData);
    await rider.save();

    const token = jwt.sign(
      { number, userId: rider._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d", // Token valid for 30 days
      }
    );


    res.status(201).json(rider, token);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateRider = async (req, res) => {
  try {
    const { phone } = req.body;


    if (!phone) {
      return res
        .status(400)
        .json({ error: "Phone number is required for update" });
    }

    // Prepare update object
    const updateData = { ...req.body };

    // Handle new uploaded images
    if (req.files) {
      updateData.images = {};
      [
        "vehicleimageFront",
        "vehicleimageBack",
        "vehicleRcFront",
        "vehicleRcBack",
        "vehicleInsurence",

        "drivingLicenseFront",
        "drivingLicenseBack",
      ].forEach((field) => {
        if (req.files[field]) {
          updateData.images[field] = req.files[field][0].path;
        }
      });
    }

    // Update rider using phone number
    const rider = await Rider.findOneAndUpdate(
      { phone },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!rider) return res.status(404).json({ error: "Rider not found" });
    res.json(rider);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ...existing code...

// // Get a single rider by ID
exports.getRiderById = async (req, res) => {
  try {
    // For GET requests, use req.query
    const number = req.query.number || req.body?.number || req.params?.number || req.headers['number'];

    const rider = await Rider.findOne({ phone: number });

    if (!rider) return res.status(404).json({ error: "Rider not found" });
    res.json(rider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// // Update a rider by ID
// exports.updateRider = async (req, res) => {
//   try {
//     const rider = await Rider.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!rider) return res.status(404).json({ error: "Rider not found" });
//     res.json(rider);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Delete a rider by ID
// exports.deleteRider = async (req, res) => {
//   try {
//     const rider = await Rider.findByIdAndDelete(req.params.id);
//     if (!rider) return res.status(404).json({ error: "Rider not found" });
//     res.json({ message: "Rider deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
