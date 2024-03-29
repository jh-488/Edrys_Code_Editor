const fs = require("fs");

const WEB_SOCKET_PORT = process.env.WEB_SOCKET_PORT || 8080;

// Websocket server configuration
const WebSocket = require("ws");
const WebSocketServer = new WebSocket.Server({ port: WEB_SOCKET_PORT });

// import compile and upload functions
const {
  compileSketch,
  uploadSketch,
} = require("./controllers/sketchControllers");

// import serial port listener
const { startSerialPortListener } = require("./controllers/serialPortListener");

// import tests
const { testFunctions } = require("./challengesTests/challengesTests");

// Serial port where the arduino is connected
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const BOARD_PORT = portIndex !== -1 ? args[portIndex + 1] : null;

if (!BOARD_PORT) {
  console.error("Error: Please provide a serial port using --port <port>");
  process.exit(1);
}

// Path where the sketch is stored
const sketchPath = "./sketch/sketch.ino";

// Compile and upload the sketch after receiving the data (code + port name)
WebSocketServer.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", async (data) => {
    // get the challengeId and userSketch from the client
    const { challengeId, code } = JSON.parse(data);

    // Get the test function for the challenge
    const testSketch = testFunctions(challengeId, code);

    // Check if the challenge test is available
    if (testSketch) {
      // Write the sketch to the file
      fs.writeFileSync(sketchPath, testSketch, "utf8");

      try {
        // Compile the sketch and send the response to the client
        const {
          message: compileMessage,
          stdout: compileStdout,
          stderr: compileStderr,
        } = await compileSketch(sketchPath);
        ws.send(
          JSON.stringify({
            message: compileMessage,
            stdout: compileStdout,
            stderr: compileStderr,
          })
        );

        // Upload the sketch and send the response to the client
        const {
          message: uploadMessage,
          stdout: uploadStdout,
          stderr: uploadStderr,
        } = await uploadSketch(BOARD_PORT, sketchPath);
        ws.send(
          JSON.stringify({
            message: uploadMessage,
            stdout: uploadStdout,
            stderr: uploadStderr,
          })
        );

        // Check if all tests passed and send the response to the client
        const allTestsPassed = await startSerialPortListener(BOARD_PORT);
        if (allTestsPassed) {
          ws.send(JSON.stringify({ testMessage: "All tests passed. You solved the challenge", testPassed: true }));
        } else {
          ws.send(JSON.stringify({ testMessage: "Some tests failed. Try again", testPassed: false }));
        }
      } catch (error) {
        console.error(error);

        // Send error response to client
        ws.send(JSON.stringify({ error: error.message + error.stderr }));
      }
    } else {
      ws.send(JSON.stringify({ error: "Test for this challenge was not found!!" }));
    }
  });
});

console.log(`Websocket server started at port ${WEB_SOCKET_PORT}`);
