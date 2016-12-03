var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(3000);

var users = [];
var user_sockets = [];

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

io.sockets.on('connection', function(socket) {
	socket.on('SendMessage', function(data) {
		var broadcast_data = {
			"username": socket.username,
			"msg": data.msg
		}
		// send to everyone including me
		//io.sockets.emit('new message', data);
		// excluding me

		if(data.targetUserName == "") {
			socket.broadcast.emit('NewMessage', broadcast_data);
		} else {
			var index = users.indexOf(data.targetUserName);
			user_sockets[index].emit('NewMessage', broadcast_data);
		}
	});

	socket.on('NewUser', function(data, callback) {
		if(users.indexOf(data.name) != -1) {
			callback(false);
		} else {
			callback(true);
			socket.username = data.name;
			users.push(socket.username);
			user_sockets.push(socket);
			io.sockets.emit('NewUserJoined', users);
		}
	});
	
	socket.on('disconnect', function() {
		if(!socket.username) return;

		var index = users.indexOf(socket.username);
		users.splice(index, 1);
		user_sockets.splice(index, 1);
		io.sockets.emit('NewUserJoined', users);	// user left	
    });
});