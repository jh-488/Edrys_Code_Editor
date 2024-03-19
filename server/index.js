const fs = require("fs");
const express = require("express");
const app = express();

const WebSocket = require("ws");
const WebSocketServer = new WebSocket.Server({ port: 8080 });

const {
  compileSketch,
  uploadSketch,
} = require("./controller/sketchControllers");

// Path where the sketch is stored
const sketchPath = "./sketch/sketch.ino";

// Serial port where the arduino is connected
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const port = portIndex !== -1 ? args[portIndex + 1] : null;

if (!port) {
  console.error("Error: Please provide a serial port using --port <port>");
  process.exit(1);
};

// Compile and upload the sketch after receiving the data (code)
WebSocketServer.on("connection", (ws, req) => {
  console.log("New client connected");

  ws.on("message", async (data) => {
    fs.writeFileSync(sketchPath, data, "utf8");

    try {
      const { message, stdout, stderr } = await compileSketch(sketchPath);
      await uploadSketch(port, sketchPath);

      // Send response to client
      ws.send(JSON.stringify({ message, stdout, stderr }));
    } catch (error) {
      console.error(error);

      // Send error response to client
      ws.send(JSON.stringify({ error: error.message }));
    }
  });
});


app.listen(3000, () => console.log(`Listening on port 3000`));
