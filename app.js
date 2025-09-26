require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require('http');
const WebSocketServer = require('./websocketServer');

const app = express();

app.use("/uploads", express.static("uploads"));

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Route placeholders
app.use("/api/v1", require("./routes/auth"));
app.use("/api/v1", require("./routes/users"));
app.use("/api/v1", require("./routes/bookings"));
app.use("/api/v1/wallet", require("./routes/wallet"));
app.use("/api/v1/riders", require("./routes/riderRouter"));
app.use("/api/v1/notification", require("./routes/notification"));

// ...existing code...

// Root endpoint
app.get("/", (req, res) => {
  res.send("RaidoDrop Backend API");
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer(server);

const PORT = process.env.PORT || 3000;

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is running on port ${PORT}`);
});
