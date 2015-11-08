/* global socket */
/* global _Data */
var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');

var ok = function (res) {
	res.status(200).send(null).end();
}

var json = function (res, json) {
	res.status(200).json(json).end();
}

var notfound = function (res) {
	res.status(404).send("Not Found").end();
}

var _findRoom = function (name) {
	for (var x=0; x < _Data.Rooms.length; x++) {
		if (_Data.Rooms[x].name === name) {
			_Data.Rooms[x].lastaccessed = new Date();
			return _Data.Rooms[x];
		}
	}
	return null;
}

var _deleteOldRoom = function (name) {
	var now = new Date();
	for (var x=0; x < _Data.Rooms.length; x++) {
		if (now - _Data.Rooms[x].lastaccessed >= 3600000) {
			_Data.Rooms.splice(x,1);
			break;
		}
	}
}

var _findUser = function (room, id) {
	for (var x=0; x < room.users.length; x++) {
		if (room.users[x].id === id) {
			return room.users[x];
		}
	}
	return null;
}

var _isRoomMatch = function (client, room) {
	return true;
}

//routes

router.get('/:name', function(req, res, next) {
	var room = _findRoom(req.params.name);
	if (room) {
		return json(res, room);
	}
	return notfound(res);
});

router.get('/:name/user', function(req, res, next) {
	var room = _findRoom(req.params.name);
	if (room) {
		var user = _findUser(room, req.session.id);
		if (user) {
			return json(res, user);
		}	
	}
	return notfound(res);
});

router.put('/:name', function(req, res, next) {
	var room = _findRoom(req.params.name);
	if (room) {
		if (req.body.description) {
			room.description = req.body.description;
		}
		//wipe all vodes
		for (var x=0; x < room.users.length; x++) {
			room.users.vote = null;
		}
		//post to socket
		socket.clients.forEach(function (client) {
			if (_isRoomMatch(client, room)) {
				client.send(JSON.stringify({ 
					room: room.name, 
					action: "updateRoom", 
					data: { 
						description: room.description 
					} 
				}));
			}
		});
		return ok(res);
	}
	return notfound(res);
});

router.put('/:name/user', function(req, res, next) {
	var room = _findRoom(req.params.name);
	if (room) {
		var user = _findUser(room, req.session.id);
		if (user) {
			if (req.body.name) {
				user.name = req.body.name;
			}
			if (req.body.active) {
				user.name = req.body.active;
			}
			//post to socket
			socket.clients.forEach(function (client) {
				if (_isRoomMatch(client, room)) {
					client.send(JSON.stringify({ 
						room: room.name, 
						action: "updateUser", 
						data: { 
							id: user.id, 
							name: user.name,
							active: user.active
						} 
					}));
				}
			});
		}
		return ok(res);
	}
	return notfound(res);
});

router.post('/', function(req, res, next) {
	var room = {
		name: uuid.v4().replace(new RegExp("-","g"),""),
		description: null,
	  	users: [],
		lastaccessed: new Date()
  	};
	//add to db
  	_Data.Rooms.push(room);
	//remove an old one
	_deleteOldRoom();
	//return
	return json(res,room);
});

router.post('/:name/user', function(req, res, next) {
	var room = _findRoom(req.params.name);
	if (room) {
		if (!_findUser(room, req.session.id)) {
			var user = {
				id: req.session.id,
				name: req.body.name,
				vote: null,
				active: req.body.active != undefined ? req.body.active : true
			};
			room.users.push(user);
			//post to socket
			socket.clients.forEach(function (client) {
				if (_isRoomMatch(client, room)) {
					client.send(JSON.stringify({ 
						room: room.name, 
						action: "addUser", 
						data: { 
							id: user.id, 
							name: user.name,
							active: user.active
						} 
					}));
				}
			});
			//add room to session
			req.session.room = room.name;
			//return
			return ok(res);
		}
	}
	return notfound(res);
});

router.post('/:name/vote/:vote', function(req, res, next) {
	var room = _findRoom(req.params.name);
	if (room) {
		var user = _findUser(room, req.session.id);
		if (user) {
			var vote = parseInt(req.params.vote);
			if (vote) {
				user.vote = vote;
				//post to socket
				socket.clients.forEach(function (client) {
					if (_isRoomMatch(client, room)) {
						client.send(JSON.stringify({ 
							room: room.name, 
							action: "vote", 
							data: { 
								id: user.id, 
								vote: vote 
							} 
						}));
					}
				});
				//return
				return ok(res);
			}
		}
	}
	return notfound(res);
});

router.delete('/:name/user/:id', function(req, res, next) {
	var room = _findRoom(req.params.name);
	if (room) {
		var user = _findUser(room, req.params.id);
		if (user) {
			user.active = false;
			//post to socket
			socket.clients.forEach(function (client) {
				if (_isRoomMatch(client, room)) {
					client.send(JSON.stringify({ 
						room: room.name, 
						action: "deleteUser", 
						data: { 
							id: user.id 
						} 
					}));
				}
			});
			//return
			return ok(res);
		}
	}
	return notfound(res);
});

module.exports = router;
