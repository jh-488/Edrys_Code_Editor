const fs = require("fs");

const WEB_SOCKET_PORT = process.env.WEB_SOCKET_PORT || 8080;

// Websocket server configuration
const WebSocket = require("ws");
const WebSocketServer = new WebSocket.Server({ port: WEB_SOCKET_PORT });

const {
  compileSketch,
  uploadSketch,
} = require("./controller/sketchControllers");


// Serial port where the arduino is connected
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const BOARD_PORT = portIndex !== -1 ? args[portIndex + 1] : null;

if (!BOARD_PORT) {
  console.error("Error: Please provide a serial port using --port <port>");
  process.exit(1);
};


// Path where the sketch is stored
const sketchPath = "./sketch/sketch.ino";

// Compile and upload the sketch after receiving the data (code + port name)
WebSocketServer.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data);

    fs.writeFileSync(sketchPath, parsedData.code, "utf8");

    try {
      // Compile and upload the sketch and send the response to the client
      const { message: compileMessage, stdout: compileStdout, stderr: compileStderr } = await compileSketch(sketchPath);
      ws.send(JSON.stringify({ message: compileMessage, stdout: compileStdout, stderr: compileStderr }));

      const { message: uploadMessage, stdout: uploadStdout, stderr: uploadStderr } = await uploadSketch(BOARD_PORT, sketchPath);
      ws.send(JSON.stringify({ message: uploadMessage, stdout: uploadStdout, stderr: uploadStderr }));
    } catch (error) {
      console.error(error);

      // Send error response to client
      ws.send(JSON.stringify({ error: error.message + error.stderr }));
    }
  });
});


console.log(`Websocket server started at port ${WEB_SOCKET_PORT}`);

