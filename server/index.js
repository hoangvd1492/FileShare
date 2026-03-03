require("dotenv").config();

const express = require("express");
const http = require("http");
const { setupSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

// Health check route (cho Render)
app.get("/", (req, res) => {
  res.send("Signal Server Running 🚀");
});

// 🔥 Import và dùng setupSocket
setupSocket(server);

// Start server
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
