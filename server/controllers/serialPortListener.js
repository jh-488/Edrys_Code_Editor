const { SerialPort, ReadlineParser } = require("serialport");

startSerialPortListener = (portName) => {
  return new Promise((resolve, reject) => {
    // Define the serial port
    const port = new SerialPort({ path: portName, baudRate: 9600 });

    const parser = new ReadlineParser();
    port.pipe(parser);

    // Flag to track if all tests passed
    let allTestsPassed = true;

    parser.on("data", (line) => {
      if (line.includes("Test summary")) {
        if (line.includes("0 failed")) {
          console.log("All tests passed");
        } else {
          console.log("Some tests failed");
          allTestsPassed = false;
        }

        // Stop listening to the serial port
        port.close();
      }
    });

    port.on("error", (err) => {
      console.error("Error reading from serial port:", err);
      reject(err);
    });

    port.on("close", () => {
      console.log("Serial port listener closed");
      resolve(allTestsPassed);
    });

    console.log(`Serial port listening on port ${portName}`);
  });
};


module.exports = { startSerialPortListener };