const User = require("../models/User");
const Rider = require("../models/RiderSchema");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const otpStoree = new Map();

exports.sendmobileOTP = async (req, res) => {
  const { number } = req.body;

  console.log(number, "number in send mobile otp");
  if (!number)
    return res.status(400).json({ message: "Phone number is required" });

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStoree.set(number, otp);

  console.log(otp);

  try {
    // SMTP Guru API configuration

    const instanceId = "67F4BD1328D8B";
    const accessToken = "66cf2b3d6b249";
    // const instanceId = "685BD4B561551"; Ridodrop
    // const accessToken = "685bd213dadf7";
    // const instanceId = "67FA189D6AE5D";  E-bay
    // const accessToken = "67fa147ed20cf";
    const message = `Welcome To Ridodrop! Your verification OTP is: ${otp}. Please do not share this OTP with anyone.`;

    // Format number to include 91 if not present
    const formattedNumber = number.startsWith("91")
      ? number
      : `91${number.replace("+", "")}`;

    const apiUrl = `https://smt.w4u.in/api/send?number=${formattedNumber}&type=text&message=${encodeURIComponent(
      message
    )}&instance_id=${instanceId}&access_token=${accessToken}`;

    const response = await axios.get(apiUrl);

    return res.status(200).json({ message: "OTP sent via WhatsApp" });
    if (response.data.status === "success") {
      console.log("succc");
    } else {
      console.error("SMTP Guru API Error:", response.data);
      return res.status(500).json({ message: "Failed to send OTP" });
    }
  } catch (err) {
    console.error("Send OTP Error:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifymobileOTP = async (req, res) => {
  const { number, otp } = req.body;

  if (!number || !otp) {
    return res
      .status(400)
      .json({ message: "Phone number and OTP are required" });
  }

  const storedOtp = otpStoree.get(number);

  if (storedOtp !== otp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  otpStoree.delete(number); // OTP is used, remove it

  try {
    let user = await User.findOne({ phone: number });

    console.log(user)

    if (!user) {
      // User is new - return response indicating new user
      return res.status(200).json({
        isNewUser: true,
        message: "New user detected. Please provide your name.",
      });
    }
    // Existing user - generate token and return
    const token = jwt.sign({ number, userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d", // Token valid for 30 days
    });

    return res.status(200).json({
      isNewUser: false,
      token,
      userId: user._id,
      user: {
        name: user.name,
        number: user.number,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.verifyRiderMobileOTP = async (req, res) => {
  const { number, otp } = req.body;

  console.log(number, otp, "number and otp in verify rider mobile otp");
  if (!number || !otp) {
    return res
      .status(400)
      .json({ message: "Phone number and OTP are required" });
  }

  const storedOtp = otpStoree.get(number);
  console.log(storedOtp, "stored otp in verify mobile otp");

  if (storedOtp !== otp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  otpStoree.delete(number); // OTP is used, remove it

  try {
    let rider = await Rider.findOne({ phone: number });

    if (!rider) {
      // User is new - return response indicating new user
      return res.status(200).json({
        isNewUser: true,
        message: "New user detected. Please provide your name.",
      });
    }

    // Existing user - generate token and return
    const token = jwt.sign(
      { number, userId: rider._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d", // Token valid for 30 days
      }
    );
    return res.status(200).json({
      isNewUser: false,
      token,
      userId: rider._id,
      user: {
        name: rider.name,
        number: rider.number,
      },
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
