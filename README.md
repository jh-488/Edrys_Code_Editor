# Edrys_Code_Editor

This is an extension of [Edrys-Module-Code](https://github.com/Cross-Lab-Project/edrys_module-editor), that makes the code editor able to connect to a server using WebSockets so it can send/receive data.

Use this URL to add the module to your class:

```
    https://jh-488.github.io/Edrys_Code_Editor/index.html
```

## Differences from the original Editor

1. The client can now connect to a server running on localhost and send the code and port name to the server (When the "Run Code" button is clicked)

```js
{
    // connect to the websocket server
    var socket = new WebSocket("ws://localhost:8080");

    Edrys.onMessage(({ from, subject, body }) => {
        ...

        // Get port name from the input field
        const portName = document.getElementById("port_input").value;

        // send the code and the port name through socket if connected
        if(portName.length === 0) {
            displayMessage("Please enter a port name!!")
        }
        else if(!socket || socket.readyState !== WebSocket.OPEN ) {
            displayMessage("Error: Server not connected!!");
        } else {
            socket.send(JSON.stringify({
                code: body,
                port: portName
            }));
    }
}
```

2. A NodeJS server that can be run locally to start the connection. When the data (code and port name) is received from the client, it will store the code in an ".ino" file, compile it and upload it to the board.

To run the server locally :

- Clone this repo and cd to /server
- npm install
- npm run server

PS: [Arduino CLI](https://arduino.github.io/arduino-cli/0.35/installation/) with your platform core should be installed on your local machine.
