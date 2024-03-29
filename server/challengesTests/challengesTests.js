// Function to add the test run function to a sketch 
const addTestRun = (sketch) => {
  const loopIndex = sketch.lastIndexOf("void loop()");
  if (loopIndex !== -1) {
    const endIndex = sketch.indexOf("}", loopIndex);
    if (endIndex !== -1) {
      return (
        sketch.slice(0, endIndex) +
        "   Test::run();\n" +
        sketch.slice(endIndex)
      );
    }
  }
}

// Test for the turn-on-led-001 challenge
const createTurnOnLedSketchTest = (usersSketch) => {
  // Add test code to the user's sketch
  const testCode = `
    #include <ArduinoUnit.h>

    ${usersSketch} 

    test(turnOnLed) {
        assertEqual(digitalRead(LED_BUILTIN), HIGH);
    }
    `;

  const testSketch = addTestRun(testCode);  
  
  return testSketch;
};

// Function to get the right test function for the challenge
const testFunctions = (challengeId, usersSketch) => {
  switch (challengeId) {
    case "turn-on-led-001":
      return createTurnOnLedSketchTest(usersSketch);
    default:
      return null;
  }
}

module.exports = { testFunctions };
