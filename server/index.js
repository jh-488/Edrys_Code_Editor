const WEB_SOCKET_PORT = process.env.WEB_SOCKET_PORT || 8080;

// Websocket server configuration
const WebSocket = require("ws");
const WebSocketServer = new WebSocket.Server({ port: WEB_SOCKET_PORT });

// import compile and upload functions
const {
  compileAndUploadSketch
} = require("./controllers/sketchControllers");

// import tests
const { testFunctions } = require("./challengesTests/challengesTests");


// Compile and upload the sketch after receiving the data 
WebSocketServer.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", async (data) => {
    // get the challengeId and userSketch from the client
    const { challengeId, code } = JSON.parse(data);

    // Get the test function for the challenge
    const testSketch = testFunctions(challengeId, code);

    // Check if the challenge test is available
    if (testSketch) {
      compileAndUploadSketch(testSketch, ws, true);
    } else {
      compileAndUploadSketch(code, ws, false);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});


console.log(`Websocket server started at port ${WEB_SOCKET_PORT}`);
