const fs = require("fs");

const WEB_SOCKET_PORT = 8080;

// Websocket server configuration
const WebSocket = require("ws");
const WebSocketServer = new WebSocket.Server({ port: WEB_SOCKET_PORT });

/*const {
  compileSketch,
  uploadSketch,
} = require("./controller/sketchControllers");


// Path where the sketch is stored
const sketchPath = "./sketch/sketch.ino";*/

// Compile and upload the sketch after receiving the data (code + port name)
WebSocketServer.on("connection", (ws, req) => {
  console.log("New client connected");

  ws.on("message", async (data) => {
    console.log(`${data}`)
    /*const parsedData = JSON.parse(data);

    fs.writeFileSync(sketchPath, parsedData.code, "utf8");

    const BOARD_PORT = await parsedData.port;

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
    }*/
  });
});


console.log(`Websocket server started at port ${WEB_SOCKET_PORT}`);

