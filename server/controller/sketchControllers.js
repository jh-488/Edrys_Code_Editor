// Import spawn to execute external commands
const { spawn } = require("child_process");

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
        resolve({ message: "Compilation successful!", stdout: stdoutData, stderr: stderrData });
      } else {
        reject({ message: `Compilation failed with code: ${code}`, stdout: stdoutData, stderr: stderrData });
      }
    });

    // Listen for errors in the compilation process
    compileProcess.on("error", (error) => {
      reject({ message: `Compilation process encountered an error: ${error.message}`, stdout: stdoutData, stderr: stderrData });
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
    uploadProcess.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    uploadProcess.stderr.on("data", (data) => {
      console.log("Compilation error:", data.toString());
    });

    // Listen for the completion of the upload process
    uploadProcess.on("close", (code) => {
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