console.log("Server is running")

var express = require('express');
var app = express();

//var server = app.listen(3000);
var port = process.env.PORT || 3000;
var server = app.listen(port);

app.use(express.static("public"));

var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(socket){
    console.log("new connection " + socket.id);
    socket.on('arrayUpdate', arrayMessage);

    function arrayMessage(data){
        //console.log(data);
        socket.broadcast.emit('arrayUpdate', data); //sends data to all windows

    }
}