// Import spawn to execute external commands
const { spawn } = require("child_process");

// Compile an arduino sketch from an .ino file
// Change the "arduino:avr:uno" with your arduino core
compileSketch = (sketchPath) => {
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
};

// Upload the compiled sketch to the board
// Change the "arduino:avr:uno" with your arduino core
uploadSketch = (port, sketchPath) => {
  return new Promise((resolve, reject) => {
    const args = ["upload", sketchPath, "-p", port, "-b", "arduino:avr:uno"]; 
    const arduinoCli = spawn("arduino-cli", args);

    arduinoCli.on("close", (code) => {
      if (code === 0) {
        resolve("Upload successful!");
      } else {
        reject(new Error(`Upload failed with code: ${code}`));
      }
    });
  });
};


module.exports = {
    compileSketch,
    uploadSketch
}