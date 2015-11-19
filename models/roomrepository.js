module.exports = function (_DB) {
    var uuid = require('node-uuid');
    
    return {
        createRoom: function (_name, _type) {
            return {
                name: _name || uuid.v4().replace(new RegExp("-", "g"), ""),
                description: null,
                type: _type,
                users: [],
                lastaccessed: new Date()
            };
        },

        addRoom: function (room) {
            _DB.insert(room);
            //remove an old, unused one
            this.deleteOldRoom();
            //return attached
            return room;
        },
    
        updateRoom: function (room) {
            _DB.update(room);
            return null;
        },
    
        findRoom: function (name) {
            var rooms = _DB.find({ "name": name });
            for (var x=0; x < rooms.length; x++) {
                return rooms[x];
            }
            return null;
        },
    
        deleteOldRoom: function () {
            var now = new Date();
            for (var room in _DB.data) {
                if ((now - room.lastaccessed) >= 3600000) {
                    _DB.remove(room);
                    break;
                }
            }
        },
    
        findUser: function (room, id) {
            for (var x = 0; x < room.users.length; x++) {
                if (room.users[x].id === id) {
                    return room.users[x];
                }
            }
            return null;
        }
    }
};