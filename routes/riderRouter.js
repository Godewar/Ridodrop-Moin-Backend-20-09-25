const express = require("express");
const router = express.Router();
const riderController = require("../controllers/riderController");
const upload = require("../utils/multerConfig");

router.post(
  "/create/rider",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "FrontaadharCard", maxCount: 1 },
    { name: "BackaadharCard", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
  ]),
  riderController.createRider
);

router.put(
  "/update/rider",
  upload.fields([
    { name: "vehicleimageFront", maxCount: 1 },
    { name: "vehicleimageBack", maxCount: 1 },
    { name: "vehicleRcFront", maxCount: 1 },
    { name: "vehicleRcBack", maxCount: 1 },
    { name: "vehicleInsurence", maxCount: 1 },
    { name: "drivingLicenseFront", maxCount: 1 },
    { name: "drivingLicenseBack", maxCount: 1 },
  ]),
  riderController.updateRider
);
router.get("/get/rider", riderController.getRiderById);
// router.get("/all/rider", riderController.getAllRiders);
// router.put("/update/:id", riderController.updateRider);
// router.delete("/delete/:id", riderController.deleteRider);

module.exports = router;
