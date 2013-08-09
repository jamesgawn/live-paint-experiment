var express = require('express'),
    app = express(),
    redraw=false,
    io = require('socket.io').listen(1000, { log: false }),
    sockets = [],
    server = require('http').createServer(app),
    socketMap={};
var moment = require('moment');


function getColour(){


    return "#"+((1<<24)*Math.random()|0).toString(16);

}

server.listen(8080);

io.sockets.on('connection', function (socket) {

    socket.on('disconnect', function(data){
        delete socketMap[socket.id];
    });

    sockets.push(socket);
    socketMap[socket.id]={x:0,y:0,colour:getColour(),prev:{}};
    socket.emit('mouseMove', socketMap);

    socket.on('mouseMove', function (data) {


        redraw=true;
        socketMap[socket.id].x = data.x;
        socketMap[socket.id].y = data.y;
        // socketMap[socket.id].colour = getColour();
    });

    socket.on("mouseUp",function(){
        socketMap[socket.id].prev={};
    });

    socket.on("sendMessage",function(data){

        console.log("message:"+data);
        for (var i=0;i<sockets.length;i++){
//if (socket!=sockets[i]){
            sockets[i].emit('receiveMessage', (moment().format("HH:mm:ss"))+": "+data);
//}
        }
    });
});

app.use(express.static(__dirname + '/public'));

setInterval(function(){
    if (redraw){



        for (var i=0;i<sockets.length;i++){



            sockets[i].emit('mouseMove', socketMap);



        }
        for (id in socketMap){
            socketMap[id].prev =   {   x: socketMap[id].x,  y:  socketMap[id].y};
        }

        redraw=false;
    }
},1000/60);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.listen(1001);
