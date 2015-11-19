module.exports = function (_IO, _DB) {
    var express = require('express');
    var router = express.Router();
    var repo = require('../models/roomrepository.js')(_DB);
    
    var ok = function (res) {
        res.status(200).send(null).end();
    }
    
    var json = function (res, json) {
        res.status(200).json(json).end();
    }
    
    var notfound = function (res) {
        res.status(404).send("Not Found").end();
    }
    
    var _initIO = function (room) {
        //create socket for the room
        _IO.of("/" + room.name).on('connection', function (socket) {
            socket.emit("room", JSON.stringify(room));
        });
    }
    
    //routes
    
    router.get('/:name', function (req, res, next) {
        var room = repo.findRoom(req.params.name);
        if (room) {
            return json(res, room);
        }
        else if (false) {
            room = repo.createRoom(req.params.name);
            repo.addRoom(room);
            _initIO(room);
        }
        return notfound(res);
    });
    
    router.get('/:name/user', function (req, res, next) {
        var room = repo.findRoom(req.params.name);
        if (room) {
            var user = repo.findUser(room, req.session.id);
            if (user) {
                return json(res, user);
            }
        }
        return notfound(res);
    });
    
    router.put('/:name', function (req, res, next) {
        var room = repo.findRoom(req.params.name);
        if (room) {
            if (req.body.description) {
                room.description = req.body.description;
            }
            //wipe all vodes
            for (var x = 0; x < room.users.length; x++) {
                room.users[x].vote = null;
            }
            //post to socket
            _IO.of('/' + room.name).emit("action", JSON.stringify({
                room: room.name, 
                action: "updateRoom", 
                data: {
                    description: room.description
                }
            }));
            
            return ok(res);
        }
        return notfound(res);
    });
    
    router.put('/:name/user', function (req, res, next) {
        var room = repo.findRoom(req.params.name);
        if (room) {
            var user = repo.findUser(room, req.session.id);
            if (user) {
                if (req.body.name) {
                    user.name = req.body.name;
                }
                if (req.body.active) {
                    user.name = req.body.active;
                }
                //post to socket
                _IO.of('/' + room.name).emit("action", JSON.stringify({
                    room: room.name, 
                    action: "updateUser", 
                    data: {
                        id: user.id, 
                        name: user.name,
                        active: user.active
                    }
                }));
            }
            return ok(res);
        }
        return notfound(res);
    });
    
    router.post('/:type', function (req, res, next) {
        var room = repo.createRoom(null, req.params.type);
        //add to db
        repo.addRoom(room);
        //initialize a socket namespace
        _initIO(room);
        //return
        return json(res, room);
    });
    
    router.post('/:name/user', function (req, res, next) {
        var room = repo.findRoom(req.params.name);
        if (room) {
            if (!repo.findUser(room, req.session.id)) {
                var user = {
                    id: req.session.id,
                    name: req.body.name,
                    admin: room.users.length == 0,
                    vote: null,
                    active: req.body.active != undefined ? req.body.active : true
                };
                room.users.push(user);
                //post to socket
                _IO.of('/' + room.name).emit("action", JSON.stringify({
                    room: room.name, 
                    action: "addUser", 
                    data: {
                        id: user.id, 
                        name: user.name,
                        active: user.active
                    }
                }));
                //add room to session
                req.session.room = room.name;
                //return
                return ok(res);
            }
        }
        return notfound(res);
    });
    
    router.post('/:name/vote/:vote', function (req, res, next) {
        var room = repo.findRoom(req.params.name);
        if (room) {
            var user = repo.findUser(room, req.session.id);
            if (user && user.active) {
                var vote = req.params.vote;
                if (vote) {
                    user.vote = vote;
                    //post to socket
                    _IO.of('/' + room.name).emit("action", JSON.stringify({
                        room: room.name, 
                        action: "vote", 
                        data: {
                            id: user.id, 
                            vote: vote
                        }
                    }));
                    //return
                    return ok(res);
                }
            }
        }
        return notfound(res);
    });
    
    router.delete('/:name/user/:id', function (req, res, next) {
        var room = repo.findRoom(req.params.name);
        if (room) {
            var user = repo.findUser(room, req.params.id);
            if (user) {
                user.active = false;
                //post to socket
                _IO.of('/' + room.name).emit("action", JSON.stringify({
                    room: room.name, 
                    action: "deleteUser", 
                    data: {
                        id: user.id
                    }
                }));
                //return
                return ok(res);
            }
        }
        return notfound(res);
    });
    
    return router;
};