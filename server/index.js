const fs = require('fs');
const express = require("express");
const app = express();

const WebSocket = require("ws");
const WebSocketServer = new WebSocket.Server({port:8080});

const { spawn } = require("child_process");

function compileSketch(sketchPath) {
  return new Promise((resolve, reject) => {
    const args = ["compile", sketchPath, "-b", "arduino:avr:uno"];
    const compileProcess = spawn("arduino-cli", args);

    compileProcess.on("close", (code) => {
      if (code === 0) {
        resolve("Compilation successful!");
      } else {
        reject(new Error(`Compilation failed with code: ${code}`));
      }
    });
  });
}

function uploadSketch(port, sketchPath) {
  return new Promise((resolve, reject) => {
    const args = ["upload", sketchPath, "-p", port, "-b", "arduino:avr:uno"]; // Adjust board and sketch path as needed
    const arduinoCli = spawn("arduino-cli", args);

    arduinoCli.on("close", (code) => {
      if (code === 0) {
        resolve("Upload successful!");
      } else {
        reject(new Error(`Upload failed with code: ${code}`));
      }
    });
  });
}

const port = "COM4"; 
const sketchPath = "./sketch/sketch.ino";

WebSocketServer.on("connection", function(ws, req) {
    console.log("connected");
    ws.on("message", async function (data) {
        const parsedData = String(data).replace(/^\s*\/\/(.*)/gm, "");
        console.log(`${parsedData}`)
        fs.writeFileSync(sketchPath, parsedData, 'utf8'); 
        
        await compileSketch(sketchPath)
        .then(() => uploadSketch(port, sketchPath))
        .then(message => console.log(message))
        .catch(error => console.error(error));
    })
});



app.listen(3000, () => console.log(`Listening on port 3000`));