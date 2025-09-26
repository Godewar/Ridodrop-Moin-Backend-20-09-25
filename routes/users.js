const express = require("express");
const router = express.Router();

const { createUser, getProfile } = require("../controllers/userController");
const upload = require("../utils/multerConfig");
const auth = require("../middlewares/auth");

router.post("/add", upload.single("profilePhoto"), createUser);
router.get("/me", auth, getProfile);

module.exports = router;
