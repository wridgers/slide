// main server setup
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// other things
var path = require('path');

// our sockets
var conn = {};

// let us get stuff please?
app.use(express.static(path.join(__dirname, 'www')));

// start listening
server.listen(80);

// connection
io.sockets.on('connection', function(socket) {
    socket.emit('identify');

    socket.on('identity', function(data) {
        var uid = data['uid'];

        if (conn[uid] == undefined)
            conn[uid] = {};

        if (data['type'] == 'viewer') {
            conn[uid]['viewer'] = socket;

            console.log(conn);
        }

        if (data['type'] == 'remote') {
            conn[uid]['remote'] = socket;

            console.log(conn);
        }

        if (conn[uid] != undefined) {
            if (conn[uid]['viewer'] != undefined && conn[uid]['remote'] != undefined) {
                console.log('both connected!');

                var viewer = conn[uid]['viewer'];
                var remote = conn[uid]['remote'];

                viewer.emit('ready');
                remote.emit('ready');

                // now set up relays
                remote.on('next', function() { viewer.emit('next'); });
                remote.on('previous', function() { viewer.emit('previous'); });
                remote.on('right', function() { viewer.emit('right'); });
                remote.on('left', function() { viewer.emit('left'); });
                remote.on('up', function() { viewer.emit('up'); });
                remote.on('down', function() { viewer.emit('down'); });
                remote.on('overview', function() { viewer.emit('overview'); });
            }
        }
    });
});