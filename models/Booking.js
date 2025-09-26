const mongoose = require("mongoose");

const FromAddressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  house: { type: String },
  receiverName: { type: String },
  receiverMobile: { type: String },
  tag: { type: String },
});

const bookingSchema = new mongoose.Schema(
  {
    amountPay: {
      type: String
    },
    bookingStatus: {
      type: String,
      default: "pending"
    },

    payFrom: {
      type: String
    },
    userId: {
      type: String,
      required: true,
    },
    rider: { type: String },

    stops: [{ type: String, maxlength: 4 }],
    vehicleType: {
      type: String,
      enum: ["2wheeler", "3wheeler", "truck"],
      // required: true,
    },
    productImages: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    tripSteps: {
      type: String
    },
    price: { type: Number },
    dropLocation: [
      {
        Address: { type: String },
        Address1: { type: String },
        Address2: { type: String },
        landmark: { type: String },
        pincode: { type: String },
        ReciversName: { type: String },
        ReciversMobileNum: { type: String },
        professional: { type: String },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    ],
    fromAddress: {
      type: FromAddressSchema,
      // required: true
    },
    riderAcceptTime: { type: Date },
    riderEndTime: { type: Date },
    currentStep: {
      type: String,
      default: 0,
    },
    distanceKm: { type: String },
    cashCollected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
