const Booking = require("../models/Booking");
const Rider = require("../models/RiderSchema");

exports.createBooking = async (req, res) => {
  try {
    console.log("Create booking request body:", req.body);
    
    // Destructure all relevant fields from the request body
    const {
      userId,
      amountPay,
      payFrom,
      pickup,
      dropoff,
      stops,
      vehicleType,
      price,
      fromAddress,
      dropLocation,
      bookingStatus = "pending",
      status = "pending",
      currentStep = "0",
      cashCollected = false
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (!vehicleType) {
      return res.status(400).json({ message: "vehicleType is required" });
    }

    // Handle stops array
    let stopsArray = [];
    if (stops) {
      stopsArray = Array.isArray(stops) ? stops : [stops];
      if (stopsArray.length > 4) {
        return res.status(400).json({ message: "Maximum 4 stops allowed" });
      }
    }

    // Handle product images if uploaded
    let productImages = [];
    if (req.files && req.files.productImages) {
      productImages = req.files.productImages.map((f) => f.path);
    }
    if (productImages.length > 4) {
      return res.status(400).json({ message: "Maximum 4 product images allowed" });
    }

    // Ensure dropLocation has proper coordinate structure
    let processedDropLocation = [];
    if (dropLocation && Array.isArray(dropLocation)) {
      processedDropLocation = dropLocation.map(drop => ({
        address: drop.address || drop.Address || drop.Address1 || '',
        latitude: drop.latitude || 0,
        longitude: drop.longitude || 0,
        Address: drop.Address || drop.address,
        Address1: drop.Address1 || drop.address,
        Address2: drop.Address2 || '',
        landmark: drop.landmark || '',
        pincode: drop.pincode || '',
        ReciversName: drop.ReciversName || drop.receiverName || '',
        ReciversMobileNum: drop.ReciversMobileNum || drop.receiverMobile || '',
        professional: drop.professional || drop.tag || ''
      }));
    }

    // Build the booking object with exact structure you want
    const bookingData = {
      userId,
      amountPay: amountPay || "0",
      bookingStatus,
      payFrom: payFrom || "drop",
      stops: stopsArray,
      vehicleType,
      productImages,
      status,
      price: price ? Number(price) : 0,
      dropLocation: processedDropLocation,
      fromAddress: fromAddress || null,
      currentStep,
      cashCollected
    };

    console.log("Creating booking with data:", bookingData);

    // Create and save the booking
    const booking = new Booking(bookingData);
    await booking.save();

    console.log("Booking created successfully:", booking._id);
    res.status(201).json(booking);
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// exports.updateBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);
//     if (!booking) return res.status(404).json({ message: "Booking not found" });
//     if (req.user.role === "rider") {
//       // Rider can accept or update status
//       if (!booking.rider) booking.rider = req.user.userId;
//       if (req.body.status) booking.status = req.body.status;
//       await booking.save();
//       return res.json(booking);
//     } else if (
//       req.user.role === "customer" &&
//       booking.customer.toString() === req.user.userId
//     ) {
//       // Customer can cancel
//       if (req.body.status === "cancelled") {
//         booking.status = "cancelled";
//         await booking.save();
//         return res.json(booking);
//       }
//     }
//     res.status(403).json({ message: "Not authorized to update booking" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.listBookings = async (req, res) => {
//   try {
//     let filter = {};
//     if (req.user.role === "customer") filter.customer = req.user.userId;
//     if (req.user.role === "rider") filter.rider = req.user.userId;
//     const bookings = await Booking.find(filter).populate(
//       "customer rider",
//       "name email phone"
//     );
//     res.json(bookings);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

exports.saveFromAddress = async (req, res) => {
  try {
    const {
      userId,
      address,
      latitude,
      longitude,
      house,
      receiverName,
      receiverMobile,
      tag,
    } = req.body;
    // if (!address || latitude == null || longitude == null) {
    //   return res.status(400).json({ message: 'Address, latitude, and longitude are required.' });
    // }

    console.log(req.body, "Sssss2uuuuuuuuu");
    const booking = new Booking({
      userId,
      fromAddress: {
        address,
        latitude,
        longitude,
        house,
        receiverName,
        receiverMobile,
        tag,
      },
    });
    await booking.save();
    return res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to save from address." });
  }
};

// // Save drop address before order
// exports.saveDropAddress = async (req, res) => {
//   try {
//     console.log(req.body, "bodyydyy");
//     const {
//       userId,
//       number,
//       address1,
//       address2,
//       landmark,
//       pincode,
//       receiverName,
//       receiverMobile,
//       tag,
//     } = req.body;
//     if (!address1) {
//       return res.status(400).json({ message: "Address 1 is required." });
//     }
//     const booking = await Booking.findOne({
//       "fromAddress.receiverMobile": number,
//     });
//     if (!booking) {
//       return res
//         .status(404)
//         .json({ message: "Booking not found for this number." });
//     }
//     // Prepare drop address object
//     const dropAddress = {
//       Address: address1,
//       Address1: address1,
//       Address2: address2,
//       landmark,
//       pincode,
//       ReciversName: receiverName,
//       ReciversMobileNum: receiverMobile,
//       professional: tag,
//     };
//     // Push to dropLocation array
//     booking.dropLocation.push(dropAddress);
//     await booking.save();
//     return res.status(200).json({ success: true, booking });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Failed to save drop address." });
//   }
// };

// // Comprehensive booking creation with all details
// exports.createBookingWithDetails = async (req, res) => {
//   try {
//     const {
//       userId,
//       amountPay,
//       payFrom,
//       pickup,
//       dropoff,
//       stops,
//       vehicleType,
//       price,
//       dropLocation,
//       fromAddress,
//     } = req.body;

//     console.log(req.body, "Formmmmmmm");
//     // Validate required fields
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     if (
//       !fromAddress ||
//       !fromAddress.address ||
//       fromAddress.latitude == null ||
//       fromAddress.longitude == null
//     ) {
//       return res.status(400).json({
//         message:
//           "From address with address, latitude, and longitude are required",
//       });
//     }

//     // Handle product images if uploaded
//     let productImages = [];
//     if (req.files && req.files.productImages) {
//       productImages = req.files.productImages.map((f) => f.path);
//     }
//     if (productImages.length > 4) {
//       return res
//         .status(400)
//         .json({ message: "Maximum 4 product images allowed" });
//     }

//     // Handle stops array
//     let stopsArray = [];
//     if (stops) {
//       stopsArray = Array.isArray(stops) ? stops : [stops];
//       if (stopsArray.length > 4) {
//         return res.status(400).json({ message: "Maximum 4 stops allowed" });
//       }
//     }
//     const bookingData = {
//       userId,
//       amountPay,
//       payFrom,
//       pickup,
//       dropoff,
//       stops: stopsArray,
//       vehicleType,
//       productImages,
//       price,
//       fromAddress,
//     };

//     // Add drop locations if provided
//     if (dropLocation && Array.isArray(dropLocation)) {
//       bookingData.dropLocation = dropLocation;
//     }

//     const booking = new Booking(bookingData);
//     await booking.save();

//     return res.status(201).json({
//       success: true,
//       message: "Booking created successfully",
//       booking,
//     });
//   } catch (err) {
//     console.error("Booking creation error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create booking",
//       error: err.message,
//     });
//   }
// };

// // Get bookings by userId and bookingStatus
// exports.getBookingsByUserAndStatus = async (req, res) => {
//   try {
//     const { userId, bookingStatus } = req.params;

//     // Validate userId
//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     // Validate bookingStatus
//     const validStatuses = ["Ongoing", "Completed", "Cancelled"];
//     if (bookingStatus && !validStatuses.includes(bookingStatus)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid booking status. Must be Ongoing, Completed, or Cancelled",
//       });
//     }

//     // Build filter object
//     const filter = { userId: userId };

//     // Add bookingStatus filter if provided
//     if (bookingStatus) {
//       filter.bookingStatus = bookingStatus;
//     }

//     console.log("Filtering bookings with:", filter);

//     // Get bookings with populated user data
//     const bookings = await Booking.find(filter)
//       .populate("customer", "name email phone")
//       .populate("rider", "name email phone")
//       .sort({ createdAt: -1 }); // Sort by newest first

//     console.log(
//       `Found ${bookings.length} bookings for user ${userId} with status ${
//         bookingStatus || "all"
//       }`
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Bookings retrieved successfully",
//       count: bookings.length,
//       bookings: bookings,
//     });
//   } catch (err) {
//     console.error("Error getting bookings by user and status:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve bookings",
//       error: err.message,
//     });
//   }
// };

// // Get all bookings for a user (all statuses)
// exports.getUserBookings = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Validate userId
//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     console.log("Getting all bookings for user:", userId);

//     // Get all bookings for the user
//     const bookings = await Booking.find({ userId: userId })
//       .populate("customer", "name email phone")
//       .populate("rider", "name email phone")
//       .sort({ createdAt: -1 }); // Sort by newest first

//     // Group bookings by status
//     const groupedBookings = {
//       Ongoing: bookings.filter(
//         (booking) => booking.bookingStatus === "Ongoing"
//       ),
//       Completed: bookings.filter(
//         (booking) => booking.bookingStatus === "Completed"
//       ),
//       Cancelled: bookings.filter(
//         (booking) => booking.bookingStatus === "Cancelled"
//       ),
//     };

//     console.log(`Found ${bookings.length} total bookings for user ${userId}`);

//     return res.status(200).json({
//       success: true,
//       message: "User bookings retrieved successfully",
//       totalCount: bookings.length,
//       bookings: groupedBookings,
//       summary: {
//         ongoing: groupedBookings.Ongoing.length,
//         completed: groupedBookings.Completed.length,
//         cancelled: groupedBookings.Cancelled.length,
//       },
//     });
//   } catch (err) {
//     console.error("Error getting user bookings:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve user bookings",
//       error: err.message,
//     });
//   }
// };

// // Update booking status
// exports.updateBookingStatus = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const { bookingStatus } = req.body;

//     // Validate bookingStatus
//     const validStatuses = ["Ongoing", "Completed", "Cancelled"];
//     if (!validStatuses.includes(bookingStatus)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid booking status. Must be Ongoing, Completed, or Cancelled",
//       });
//     }

//     // Find and update the booking
//     const booking = await Booking.findByIdAndUpdate(
//       bookingId,
//       { bookingStatus: bookingStatus },
//       { new: true }
//     )
//       .populate("customer", "name email phone")
//       .populate("rider", "name email phone");

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     console.log(`Updated booking ${bookingId} status to ${bookingStatus}`);

//     return res.status(200).json({
//       success: true,
//       message: "Booking status updated successfully",
//       booking: booking,
//     });
//   } catch (err) {
//     console.error("Error updating booking status:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update booking status",
//       error: err.message,
//     });
//   }
// };

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.assignOrder = async (req, res) => {
  try {
    const { bookingId, driverId, status } = req.body;


    // Fetch booking and driver
    const booking = await Booking.findById(bookingId);
    const driver = await Rider.findById(driverId);

    if (!booking || !driver) {
      return res.status(404).json({ message: "Booking or Driver not found" });
    }

    // // Calculate distances
    // const driverToFromKm = getDistanceFromLatLonInKm(
    //   driver.latitude,
    //   driver.longitude,
    //   booking.fromAddress.latitude,
    //   booking.fromAddress.longitude
    // );

    // // Assume first drop location for demo
    // const drop = booking.dropLocation[0];
    // const fromToDropKm = getDistanceFromLatLonInKm(
    //   booking.fromAddress.latitude,
    //   booking.fromAddress.longitude,
    //   drop.latitude,
    //   drop.longitude
    // );

    // // Example price calculation (customize as needed)
    // const price = (driverToFromKm + fromToDropKm) * 10; // 10 currency units per km

    // Assign driver to booking
    booking.rider = driver._id;
    booking.status = "accepted";
    // booking.price = price;
    booking.riderAcceptTime = new Date();
    // If the request includes status 'completed', set riderEndTime
    if (req.body.status === 'completed') {
      booking.status = 'completed';
      booking.riderEndTime = new Date();
    }
    await booking.save();

    res.json({
      message: "Order assigned to driver",
      orderDetails: {
        from: booking.fromAddress,
        to: booking.dropLocation,
        // driverToFromKm: driverToFromKm.toFixed(2),
        // fromToDropKm: fromToDropKm.toFixed(2),
        // price: price.toFixed(2),
      },
    });
  } catch (err) {res) => {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
};



// exports.getAvailableBookingsForDriver = async (req, res) => {
//   try {
//     const { latitude, longitude, number } = req.body; // driver's phone number

//     console.log(latitude, longitude, number, "in available booking")
    
//     if (latitude == null || longitude == null || !number) {
//       return res
//         .status(400)
//         .json({ message: "Driver latitude, longitude, and phone number required" });
//     }

//     // Fetch the driver's vehicle type
//     const rider = await Rider.findOne({ phone: number });

//     if (!rider || !rider.vehicleType) {
//       return res.status(404).json({ message: "Rider or vehicle type not found" });
//     }
    
//     const driverVehicleType = rider.vehicleType;

//     console.log("Driver vehicle type:", driverVehicleType)
    
//     // Find bookings that are not yet assigned to a rider, are ongoing/pending, and match vehicle type
//     const bookings = await Booking.find({
//       rider: { $exists: false },
//       vehicleType: driverVehicleType, // Filter by vehicle type
//       $or: [
//         { status: "pending" },
//         { bookingStatus: "Ongoing" }
//       ],
//       status: { $ne: "completed" },
//       bookingStatus: { $ne: "Completed" }
//     });

//     console.log(`Found ${bookings.length} bookings matching criteria`);

//     const result = bookings
//       .map((booking) => {
//         if (!booking.fromAddress || !booking.dropLocation.length) return null;
//         const drop = booking.dropLocation[0];

//         // Calculate driver to pickup distance
//         const driverToFromKm = getDistanceFromLatLonInKm(
//           latitude,
//           longitude,
//           booking.fromAddress.latitude,
//           booking.fromAddress.longitude
//         );

//         // Calculate pickup to drop distance only if drop has lat/lng
//         let fromToDropKm = 0;
//         if (
//           drop &&
//           typeof drop.latitude === "number" &&
//           typeof drop.longitude === "number"
//         ) {
//           fromToDropKm = getDistanceFromLatLonInKm(
//             booking.fromAddress.latitude,
//             booking.fromAddress.longitude,
//             drop.latitude,
//             drop.longitude
//           );
//         }

//         // Only show orders within reasonable distance (optional filter)
//         // if (driverToFromKm > 10) return null;

//         return {
//           bookingId: booking._id,
//           from: booking.fromAddress,
//           to: drop,
//           driverToFromKm: driverToFromKm.toFixed(2),
//           fromToDropKm: fromToDropKm.toFixed(2),
//           price: booking.amountPay,
//           status: booking.status || booking.bookingStatus,
//         };
//       })
//       .filter(Boolean);

//     console.log(`Returning ${result.length} orders to driver`);
    
//     res.json({
//       message: "Available bookings for driver",
//       bookings: result,
//     });
//   } catch (err) {
//     console.error("Error in getAvailableBookingsForDriver:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.getAvailableBookingsForDriver = async (req, res) => {
//   try {
//     const { latitude, longitude, number } = req.body; // driver's phone number

//     console.log("🔍 getAvailableBookingsForDriver called with:", { latitude, longitude, number });
    
//     if (latitude == null || longitude == null || !number) {
//       console.log("❌ Missing required parameters");
//       return res
//         .status(400)
//         .json({ message: "Driver latitude, longitude, and phone number required" });
//     }

//     // Fetch the driver's vehicle type
//     const rider = await Rider.findOne({ phone: number });
//     console.log("🔍 Found rider:", rider ? `${rider.name} (${rider.vehicleType})` : "Not found");

//     if (!rider) {
//       console.log("❌ Rider not found for phone:", number);
//       return res.status(404).json({ message: "Rider not found" });
//     }
    
//     if (!rider.vehicleType) {
//       console.log("❌ Vehicle type not set for rider");
//       return res.status(404).json({ message: "Vehicle type not found for rider" });
//     }
    
//     const driverVehicleType = rider.vehicleType.toLowerCase(); // Make case insensitive

//     console.log("🚗 Driver vehicle type:", driverVehicleType);
    
//     // More flexible query - find bookings that could be available
//     const query = {
//       $and: [
//         // Either no rider assigned OR rider field is null/empty
//         {
//           $or: [
//             { rider: { $exists: false } },
//             { rider: null },
//             { rider: "" }
//           ]
//         },
//         // Status conditions - more flexible
//         {
//           $or: [
//             { status: "pending" },
//             { status: "created" },
//             { bookingStatus: "Ongoing" },
//             { bookingStatus: "ongoing" },
//             { bookingStatus: "Pending" },
//             { bookingStatus: "pending" }
//           ]
//         },
//         // Not completed
//         {
//           $and: [
//             { status: { $ne: "completed" } },
//             { status: { $ne: "cancelled" } },
//             { bookingStatus: { $ne: "Completed" } },
//             { bookingStatus: { $ne: "Cancelled" } }
//           ]
//         }
//       ]
//     };

//     // Add vehicle type filter if specified
//     if (driverVehicleType && driverVehicleType !== 'any') {
//       query.$and.push({
//         $or: [
//           { vehicleType: driverVehicleType },
//           { vehicleType: driverVehicleType.charAt(0).toUpperCase() + driverVehicleType.slice(1) },
//           { vehicleType: { $regex: new RegExp(driverVehicleType, 'i') } }
//         ]
//       });
//     }

//     console.log("🔍 Query:", JSON.stringify(query, null, 2));
    
//     // Find bookings with flexible criteria
//     const bookings = await Booking.find(query);

//     console.log(`📋 Found ${bookings.length} raw bookings matching criteria`);
    
//     if (bookings.length > 0) {
//       console.log("📋 Sample booking:", {
//         id: bookings[0]._id,
//         status: bookings[0].status,
//         bookingStatus: bookings[0].bookingStatus,
//         vehicleType: bookings[0].vehicleType,
//         hasFromAddress: !!bookings[0].fromAddress,
//         hasDropLocation: !!bookings[0].dropLocation?.length,
//         rider: bookings[0].rider
//       });
//     }

//     const result = bookings
//       .map((booking) => {
//         // Check if booking has required address data
//         if (!booking.fromAddress) {
//           console.log(`⚠️ Skipping booking ${booking._id} - no fromAddress`);
//           return null;
//         }
        
//         if (!booking.dropLocation || !booking.dropLocation.length) {
//           console.log(`⚠️ Skipping booking ${booking._id} - no dropLocation`);
//           return null;
//         }

//         const drop = booking.dropLocation[0];

//         // Validate fromAddress coordinates
//         if (typeof booking.fromAddress.latitude !== "number" || 
//             typeof booking.fromAddress.longitude !== "number") {
//           console.log(`⚠️ Skipping booking ${booking._id} - invalid fromAddress coordinates`);
//           return null;
//         }

//         // Calculate driver to pickup distance
//         const driverToFromKm = getDistanceFromLatLonInKm(
//           latitude,
//           longitude,
//           booking.fromAddress.latitude,
//           booking.fromAddress.longitude
//         );

//         // Calculate pickup to drop distance only if drop has lat/lng
//         let fromToDropKm = 0;
//         if (
//           drop &&
//           typeof drop.latitude === "number" &&
//           typeof drop.longitude === "number"
//         ) {
//           fromToDropKm = getDistanceFromLatLonInKm(
//             booking.fromAddress.latitude,
//             booking.fromAddress.longitude,
//             drop.latitude,
//             drop.longitude
//           );
//         } else {
//           console.log(`⚠️ Drop location has no coordinates for booking ${booking._id}`);
//         }

//         // Filter by distance (optional - can be disabled for testing)
//         const maxDistance = 50; // km - increased for testing
//         if (driverToFromKm > maxDistance) {
//           console.log(`⚠️ Skipping booking ${booking._id} - too far (${driverToFromKm.toFixed(2)}km)`);
//           return null;
//         }

//         // Get price from multiple possible fields
//         const price = booking.amountPay || booking.price || 0;

//         const result = {
//           bookingId: booking._id,
//           from: booking.fromAddress,
//           to: drop,
//           driverToFromKm: driverToFromKm.toFixed(2),
//           fromToDropKm: fromToDropKm.toFixed(2),
//           price: price,
//           status: booking.status || booking.bookingStatus,
//           vehicleType: booking.vehicleType,
//           createdAt: booking.createdAt
//         };

//         console.log(`✅ Including booking ${booking._id}:`, {
//           distance: `${driverToFromKm.toFixed(2)}km`,
//           price: price,
//           status: result.status
//         });

//         return result;
//       })
//       .filter(Boolean);

//     console.log(`📤 Returning ${result.length} orders to driver`);
    
//     // Add debug info in response
//     const response = {
//       message: "Available bookings for driver",
//       bookings: result,
//       debug: {
//         totalFound: bookings.length,
//         returned: result.length,
//         driverVehicleType: driverVehicleType,
//         query: query
//       }
//     };
    
//     res.json(response);
//   } catch (err) {
//     console.error("❌ Error in getAvailableBookingsForDriver:", err);
//     res.status(500).json({ 
//       message: err.message,
//       error: "Server error in getAvailableBookingsForDriver"
//     });
//   }
// };

exports.getAvailableBookingsForDriver = async (req, res) => {
  try {
    const { latitude, longitude, number } = req.body; // driver's phone number

    console.log("🔍 getAvailableBookingsForDriver called with:", { latitude, longitude, number });
    
    if (latitude == null || longitude == null || !number) {
      console.log("❌ Missing required parameters");
      return res
        .status(400)
        .json({ message: "Driver latitude, longitude, and phone number required" });
    }

    // Fetch the driver's vehicle type
    const rider = await Rider.findOne({ phone: number });
    console.log("🔍 Found rider:", rider ? `${rider.name} (${rider.vehicleType})` : "Not found");

    if (!rider) {
      console.log("❌ Rider not found for phone:", number);
      return res.status(404).json({ message: "Rider not found" });
    }
    
    if (!rider.vehicleType) {
      console.log("❌ Vehicle type not set for rider");
      return res.status(404).json({ message: "Vehicle type not found for rider" });
    }
    
    const driverVehicleType = rider.vehicleType.toLowerCase(); // Make case insensitive

    console.log("🚗 Driver vehicle type:", driverVehicleType);
    
    // More flexible query - find bookings that could be available
    const query = {
      $and: [
        // Either no rider assigned OR rider field is null/empty
        {
          $or: [
            { rider: { $exists: false } },
            { rider: null },
            { rider: "" }
          ]
        },
        // Status conditions - more flexible
        {
          $or: [
            { status: "pending" },
            { status: "created" },
            { bookingStatus: "Ongoing" },
            { bookingStatus: "ongoing" },
            { bookingStatus: "Pending" },
            { bookingStatus: "pending" }
          ]
        },
        // Not completed
        {
          $and: [
            { status: { $ne: "completed" } },
            { status: { $ne: "cancelled" } },
            { bookingStatus: { $ne: "Completed" } },
            { bookingStatus: { $ne: "Cancelled" } }
          ]
        }
      ]
    };

    // Add vehicle type filter with mapping
    if (driverVehicleType && driverVehicleType !== 'any') {
      // Create vehicle type mapping
      const vehicleTypeMapping = {
        '2wheeler': ['2wheeler', 'bike', 'motorcycle', 'scooter'],
        '3wheeler': ['3wheeler', 'auto', 'rickshaw'],
        'truck': ['truck', 'lorry', 'van'],
        'bike': ['bike', '2wheeler', 'motorcycle', 'scooter'],
        'auto': ['auto', '3wheeler', 'rickshaw']
      };
      
      const allowedTypes = vehicleTypeMapping[driverVehicleType.toLowerCase()] || [driverVehicleType];
      console.log(`🚗 Vehicle type mapping: ${driverVehicleType} -> [${allowedTypes.join(', ')}]`);
      
      query.$and.push({
        $or: [
          { vehicleType: { $in: allowedTypes } },
          { vehicleType: { $regex: new RegExp(allowedTypes.join('|'), 'i') } }
        ]
      });
    }

    console.log("🔍 Query:", JSON.stringify(query, null, 2));
    
    // Find bookings with flexible criteria
    const bookings = await Booking.find(query);

    console.log(`📋 Found ${bookings.length} raw bookings matching criteria`);
    
    if (bookings.length > 0) {
      console.log("📋 Sample booking:", {
        id: bookings[0]._id,
        status: bookings[0].status,
        bookingStatus: bookings[0].bookingStatus,
        vehicleType: bookings[0].vehicleType,
        hasFromAddress: !!bookings[0].fromAddress,
        hasDropLocation: !!bookings[0].dropLocation?.length,
        rider: bookings[0].rider
      });
    }

    const result = bookings
      .map((booking) => {
        // For debugging, show bookings even without complete address data
        if (!booking.fromAddress) {
          console.log(`⚠️ Booking ${booking._id} missing fromAddress - using placeholder`);
          // Create placeholder fromAddress for testing
          const placeholderFrom = {
            address: "Address not provided",
            latitude: 12.9716, // Default Bangalore coordinates
            longitude: 77.5946,
            house: "N/A",
            receiverName: "Unknown",
            receiverMobile: "N/A"
          };
          booking.fromAddress = placeholderFrom;
        }
        
        if (!booking.dropLocation || !booking.dropLocation.length) {
          console.log(`⚠️ Booking ${booking._id} missing dropLocation - using placeholder`);
          // Create placeholder dropLocation for testing
          booking.dropLocation = [{
            Address: "Drop location not provided",
            latitude: 12.9716,
            longitude: 77.5946,
            ReciversName: "Unknown"
          }];
        }

        const drop = booking.dropLocation[0];

        // Validate fromAddress coordinates
        const fromLat = booking.fromAddress.latitude || 12.9716;
        const fromLng = booking.fromAddress.longitude || 77.5946;

        // Calculate driver to pickup distance
        const driverToFromKm = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          fromLat,
          fromLng
        );

        // Calculate pickup to drop distance only if drop has lat/lng
        let fromToDropKm = 0;
        if (
          drop &&
          typeof drop.latitude === "number" &&
          typeof drop.longitude === "number"
        ) {
          fromToDropKm = getDistanceFromLatLonInKm(
            fromLat,
            fromLng,
            drop.latitude,
            drop.longitude
          );
        } else {
          console.log(`⚠️ Drop location has no coordinates for booking ${booking._id}`);
          fromToDropKm = 5; // Default distance for testing
        }

        // Filter by distance (increased for testing)
        const maxDistance = 100; // km - very generous for testing
        if (driverToFromKm > maxDistance) {
          console.log(`⚠️ Skipping booking ${booking._id} - too far (${driverToFromKm.toFixed(2)}km)`);
          return null;
        }

        // Get price from multiple possible fields
        const price = booking.amountPay || booking.price || "50"; // Default price for testing

        const result = {
          bookingId: booking._id,
          from: booking.fromAddress,
          to: drop,
          driverToFromKm: driverToFromKm.toFixed(2),
          fromToDropKm: fromToDropKm.toFixed(2),
          price: price,
          status: booking.status || booking.bookingStatus,
          vehicleType: booking.vehicleType,
          createdAt: booking.createdAt
        };

        console.log(`✅ Including booking ${booking._id}:`, {
          distance: `${driverToFromKm.toFixed(2)}km`,
          price: price,
          status: result.status,
          vehicleType: booking.vehicleType
        });

        return result;
      })
      .filter(Boolean);

    console.log(`📤 Returning ${result.length} orders to driver`);
    
    // Add debug info in response
    const response = {
      message: "Available bookings for driver",
      bookings: result,
      debug: {
        totalFound: bookings.length,
        returned: result.length,
        driverVehicleType: driverVehicleType,
        query: query
      }
    };
    
    res.json(response);
  } catch (err) {
    console.error("❌ Error in getAvailableBookingsForDriver:", err);
    res.status(500).json({ 
      message: err.message,
      error: "Server error in getAvailableBookingsForDriver"
    });
  }
};




exports.getOngoingBookingForRider = async (req, res) => {
  try {
    const { riderId, phone } = req.query;


    let riderQuery = {};

    if (riderId) {
      riderQuery.rider = riderId;
    } else if (phone) {
      // Find rider by phone
      const rider = await Rider.findOne({ phone });
      if (!rider) return res.status(404).json({ message: 'Rider not found' });
      riderQuery.rider = rider._id;
    } else {
      return res.status(400).json({ message: 'riderId or phone required' });
    }
    // Find ongoing booking
    const booking = await Booking.findOne({
      ...riderQuery,
      $or: [
        { status: { $in: ['accepted', 'in_progress'] } },
      ]
    });


    // console.log(booking, "ssswwwwwwwwwwwwwwww")
    if (!booking) return res.status(404).json({ message: 'No ongoing booking found' });

    // Manually fetch customer and rider
    const customer = booking.userId ? await require('../models/User').findById(booking.userId) : null;
    const bookingObj = booking.toObject();
    bookingObj.customer = customer;


    res.json(bookingObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get booking details with rider details
exports.getBookingWithRiderDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    let riderDetails = null;
    if (booking.rider) {
      // Rider is stored as string ID
      riderDetails = await Rider.findById(booking.rider);
    }
    res.json({ booking, riderDetails });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.uploadBookingImage = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const imagePath = req.file.path; // multer adds this

    console.log(bookingId, imagePath, "data from images");
    // Find booking and push image path
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Ensure productImages array exists
    if (!Array.isArray(booking.productImages)) {
      booking.productImages = [];
    }
    // Only add if not already present
    if (!booking.productImages.includes(imagePath)) {
      booking.productImages.push(imagePath);
      await booking.save();
      console.log(imagePath, "Image path saved to booking");
      res.json({ message: 'Image uploaded and saved', imagePath, booking });
    } else {
      res.json({ message: 'Image already uploaded', imagePath, booking });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error uploading image', error: err.message });
  }
};

exports.updateBookingStep = async (req, res) => {
  try {
    const bookingId = req.params.id;


    console.log(req.params, "eddede")
    const { currentStep } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { currentStep },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Step updated', booking });
  } catch (err) {
    res.status(500).json({ message: 'Error updating step', error: err.message });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    console.log(bookingId)
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'completed', currentStep: 4 },
      { new: true }
    );

    console.log(booking)
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking completed', booking });
  } catch (err) {
    res.status(500).json({ message: 'Error completing booking', error: err.message });
  }
};

// Get order history for user or rider by id
exports.getOrderHistory = async (req, res) => {
  try {
    const { userId, rider } = req.query;
    if (!userId && !rider) {
      return res.status(400).json({ message: 'userId or rider is required' });
    }
    if (userId && rider) {
      return res.status(400).json({ message: 'Provide only userId or rider, not both' });
    }
    let filter = {};
    if (userId) {
      filter.userId = userId;
    } else if (rider) {
      filter.rider = rider;
    }
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json({ count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark cash as collected for a booking
exports.collectCash = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { cashCollected: true },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Cash collected', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Save drop location data - Following SaveFromAddress pattern
exports.saveDropLocation = async (req, res) => {
  try {
    const {
      userId,
      selectedAddress,
      selectedLocation,
      pickupAddress,
      pickupLocation,
      midStops,
      dropDetails,
      address,
      latitude,
      longitude,
      house,
      receiverName,
      receiverMobile,
      tag,
      landmark,
      pincode,
      useMyNumber,
      saveAs,
      userPhoneNumber
    } = req.body;

    console.log(req.body, "SaveDropLocation data");

    // Create booking with dropLocation data following SaveFromAddress pattern
    const booking = new Booking({
      userId,
      dropLocation: [{
        // Support both new mobile app structure and legacy structure
        address: selectedAddress || address,
        latitude: selectedLocation?.latitude || latitude,
        longitude: selectedLocation?.longitude || longitude,
        house: house,
        receiverName: dropDetails?.receiverName || receiverName,
        receiverMobile: dropDetails?.receiverNumber || receiverMobile,
        tag: dropDetails?.saveAs || tag,
        landmark: dropDetails?.landmark || landmark,
        pincode: dropDetails?.pincode || pincode,
        useMyNumber: dropDetails?.useMyNumber || useMyNumber,
        userPhoneNumber: dropDetails?.userPhoneNumber || userPhoneNumber,
        // Additional mobile app fields
        pickupAddress,
        pickupLocation,
        midStops: midStops || []
      }]
    });
    
    await booking.save();
    return res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to save drop location." });
  }
};
