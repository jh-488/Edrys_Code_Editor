# Edrys_Code_Editor

This is an extension of [Edrys-Module-Code](https://github.com/Cross-Lab-Project/edrys_module-editor), that makes the code editor able to connect to a server using WebSockets so it can send/receive data.

## Differences from the original Editor

1. The client can now connect to a server running on localhost and send the code within it to the server (When the "Run Code" button is clicked)

```js
{
    // connect to the websocket server
    var socket = new WebSocket("ws://localhost:8080");

    Edrys.onMessage(({ from, subject, body }) => {
        ...

        // send the code through socket
        socket.send(body);
    }
}
```

2. A NodeJS server that can be run locally to start the connection. When the data (code) is received from the client, it will store it in an ".ino" file, compile it and upload it to the board.

To run the server locally :

* Clone this repo and cd to /server
* npm install
* node ./index.js --port "port-name" \
(e.g. node .\index.js --port COM4)
