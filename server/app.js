const http = require('http');
const fs = require('fs');
const index = fs.readFileSync( '../index.html');


const app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

const io = require('socket.io')(app);

io.on('connection', function(socket) {
    
    socket.on('data',function(data){
        
        console.log( data );    
    });
    
});


app.listen(3000, () => console.log("Listening on port 3000..."));