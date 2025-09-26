const express = require("express");
const router = express.Router();
const {
  sendmobileOTP,
  verifymobileOTP,
  verifyRiderMobileOTP,
} = require("../controllers/authController");
const multer = require("../utils/multerConfig");

router.post("/send-otp", sendmobileOTP);
router.post("/verify-otp", verifymobileOTP);
router.post("/verify-rider-otp", verifyRiderMobileOTP);

module.exports = router;
