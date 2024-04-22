# Edrys_Code_Editor

This is an extension of [Edrys-Module-Code](https://github.com/Cross-Lab-Project/edrys_module-editor), that makes the code editor able to connect to the [Edrys_Server](https://github.com/jh-488/edrys_server) using WebSockets so it can send/receive data.

Use this URL to add the module to your class:

```
    https://jh-488.github.io/Edrys_Code_Editor/index.html
```

## Difference from the original Editor

The client can now connect to a server running on a station and send the code to the server (When the "Run Code" button is clicked)

```js
{
    // connect to the websocket server
    var socket = new WebSocket(Edrys?.module?.serverURL || "ws://localhost:8080");

    Edrys.onMessage(({ from, subject, body }) => {
        ...

        if (Edrys.role === "station") {
            // send the code and the challenge id through socket if connected
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                Edrys.sendMessage('server-response', "Error: Server not connected!!");
                } else {
                    socket.send(JSON.stringify({
                        code: body,
                        challengeId: Edrys.module.challengeId
                }));
            }
        }
    } 
}
```

