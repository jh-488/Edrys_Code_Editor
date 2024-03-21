const fs = require("fs");
const express = require("express");
const app = express();

const PORT = 3000;

const WebSocket = require("ws");
const WebSocketServer = new WebSocket.Server({ port: PORT });

const {
  compileSketch,
  uploadSketch,
} = require("./controller/sketchControllers");

// Path where the sketch is stored
const sketchPath = "./sketch/sketch.ino";


// Compile and upload the sketch after receiving the data (code + port name)
WebSocketServer.on("connection", (ws, req) => {
  console.log("New client connected");

  ws.on("message", async (data) => {

    const parsedData = JSON.parse(data);

    fs.writeFileSync(sketchPath, parsedData.code, "utf8");

    const boardPort = await parsedData.port;

    try {
      // Compile and upload the sketch and send the response to the client
      const { message: compileMessage, stdout: compileStdout, stderr: compileStderr } = await compileSketch(sketchPath);
      ws.send(JSON.stringify({ message: compileMessage, stdout: compileStdout, stderr: compileStderr }));

      const { message: uploadMessage, stdout: uploadStdout, stderr: uploadStderr } = await uploadSketch(boardPort, sketchPath);
      ws.send(JSON.stringify({ message: uploadMessage, stdout: uploadStdout, stderr: uploadStderr }));
    } catch (error) {
      console.error(error);

      // Send error response to client
      ws.send(JSON.stringify({ error: error.message + error.stderr }));
    }
  });
});


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
