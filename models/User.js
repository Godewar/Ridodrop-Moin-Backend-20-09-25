const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    lname: { type: String },
    email: { type: String },
    phone: { type: String, required: true, unique: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    profilePhoto: { type: String },
    role: { type: String, enum: ["customer", "rider"], required: true },
    walletBalance: { type: Number, default: 0 },
    isBlocked: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RaidoDropUsers", userSchema);
