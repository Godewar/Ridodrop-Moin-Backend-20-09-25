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
  .then(async () => {
    console.log("MongoDB connected");
    
    // Clean up problematic indexes on startup
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      // Check if raidodropusers collection exists
      const userCollection = collections.find(col => col.name === 'raidodropusers');
      if (userCollection) {
        // Get all indexes and drop problematic ones
        try {
          const indexes = await db.collection('raidodropusers').indexes();
          const problematicIndexes = ['customerId_1', 'referralCode_1', 'email_1'];
          
          for (const indexName of problematicIndexes) {
            const indexExists = indexes.find(idx => idx.name === indexName);
            if (indexExists) {
              try {
                await db.collection('raidodropusers').dropIndex(indexName);
                console.log(`Dropped problematic ${indexName} index`);
              } catch (indexErr) {
                console.log(`Failed to drop ${indexName}: ${indexErr.message}`);
              }
            } else {
              console.log(`${indexName} index not found`);
            }
          }
        } catch (listErr) {
          console.log("Could not list indexes:", listErr.message);
        }
      }
    } catch (cleanupErr) {
      console.log("Index cleanup completed");
    }
  })
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
  res.json({ 
    message: "RaidoDrop Backend API", 
    status: "running", 
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Test endpoint for diagnostics
app.get("/api/v1/test", (req, res) => {
  res.json({ 
    message: "API endpoint working", 
    status: "success",
    timestamp: new Date().toISOString()
  });
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
