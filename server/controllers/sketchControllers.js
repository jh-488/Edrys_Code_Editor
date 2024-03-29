// Import spawn to execute external commands
const { spawn } = require("child_process");

const fs = require("fs");
const { startSerialPortListener } = require("./serialPortListener");

// Compile an arduino sketch from an .ino file
// Change the "arduino:avr:uno" with your arduino core
compileSketch = (sketchPath) => {
  return new Promise((resolve, reject) => {
    const args = ["compile", "--log-level", "error", sketchPath, "-b", "arduino:avr:uno"];
    //const args = ["compile", sketchPath, "-b", "arduino:avr:uno"];
    const compileProcess = spawn("arduino-cli", args);

    // Listen for messages and errors in the compilation process
    let stdoutData = ""; 
    let stderrData = ""; 

    compileProcess.stdout.on("data", (data) => {
      stdoutData += data.toString(); 
    });

    compileProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    // Listen for the completion of the compilation process
    compileProcess.on("close", (code) => {
      if (code === 0) {
        resolve({ message: "Compilation successful!", stdout: stdoutData });
      } else {
        reject({ message: `Compilation failed with code: ${code}`, stderr: stderrData });
      }
    });
  });
};

// Upload the compiled sketch to the board
// Change the "arduino:avr:uno" with your arduino core
uploadSketch = (port, sketchPath) => {
  return new Promise((resolve, reject) => {
    const args = ["upload", sketchPath, "-p", port, "-b", "arduino:avr:uno"]; 
    const uploadProcess = spawn("arduino-cli", args);

    // Listen for messages and errors in the upload process
    let stdoutData = ""; 
    let stderrData = ""; 

    uploadProcess.stdout.on("data", (data) => {
      stdoutData += data.toString(); 
    });

    uploadProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    // Listen for the completion of the upload process
    uploadProcess.on("close", (code) => {
      if (code === 0) {
        resolve({ message: "Upload successful!", stdout: stdoutData });
      } else {
        reject({ message: `Upload failed with code: ${code}`, stderr: stderrData });
      }
    });
  });
};



// Path where the sketch is stored
const sketchPath = "./sketch/sketch.ino";

// Serial port where the arduino is connected
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const BOARD_PORT = portIndex !== -1 ? args[portIndex + 1] : null;

if (!BOARD_PORT) {
  console.error("Error: Please provide a serial port using --port <port>");
  process.exit(1);
}

// Compile and upload the sketch after receiving the data 
// if the sketch is of type challenge, run the tests. Else just compile and upload
const compileAndUploadSketch = async (sketch, ws, isChallenge) => {
  // Write the sketch to the file
  fs.writeFileSync(sketchPath, sketch, "utf8");

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

    if (isChallenge) {
      // Check if all tests passed and send the response to the client
      const allTestsPassed = await startSerialPortListener(BOARD_PORT);
      if (allTestsPassed) {
        ws.send(JSON.stringify({ testMessage: "All tests passed. You solved the challenge", testPassed: true }));
      } else {
        ws.send(JSON.stringify({ testMessage: "Some tests failed. Try again", testPassed: false }));
      }
    }
  } catch (error) {
    console.error(error);

    // Send error response to client
    ws.send(JSON.stringify({ error: error.message + error.stderr }));
  }
};

module.exports = {
    compileAndUploadSketch
}