define(
	[
		'jquery','kendo', "socket.io",
		'model/roomrepository',
		'_kendo/kendo.window.min'
	], 
	function ($,kendo, io, repo) {
        return {
            sLink: null,
            oRoom: null,
			oUser: null,
			
            sUserName: "",
            bUserActive: true,
			
			_node: null,
			_socket: null,
			
			init: function (node, args) {
				var self = this;
				//set vars
				this._node = node;
                this.set("sLink", location.href.replace("/#room?n=", "#"));
				//connect to socket!
				this._socket = io("//"+location.host+"/"+args.n);
				this._socket.on("room", function (msg) {
					var room = JSON.parse(msg);
					self.set("sDescription", room.description);
				});
				this._socket.on("action", function (msg) {
					self._incoming(JSON.parse(msg));
				});
				return $.when(
					//get room
					repo.read(args.n).then(function(room) {
						self.set("oRoom", room);
					}),
					//ask for name
					repo.readUser(args.n).then(function (user) {
						self.set("oUser", user);
					}).fail(function () {
						$("#adduser").data("kendoWindow").center().open();
					})
				).then(function () {
					self.adduser_close();
				});
			},
			
			deinit: function () {
				this._socket.close();
				$("#adduser").data("kendoWindow").close().destroy()
			},
			
			adduser_click: function () {
				var node = $("#adduser");
				kendo.ui.progress(node, true);
				repo.addUser(this.get("oRoom").name, this.get("sUserName"), this.get("bUserActive")).then(function () {
					kendo.ui.progress(node, false);
					node.data("kendoWindow").close();
				});
			},
			
			adduser_close: function () {
				var self = this;
				var room = this.get("oRoom");
				var user = this.get("oUser");
				
				if (room && !user) {
					repo.readUser(room.name).then(function (user) {
						self.set("oUser", user);
						self._loadRoomType();
					});	
				}
				else if (room) {
					self._loadRoomType();
				}
			},
			
			_incoming: function (msg) {
				var room = this.get("oRoom");
				var user = this.get("oUser");
				switch (msg.action) {
					case "updateRoom":
						if (msg.data.description) {
							room.set("description", msg.data.description);
						}
						//clear votes
						$.each(room.users, function (idx, _user) {
							if (_user.id === msg.data.id) {
								_user.set("vote",null);
							}
						});
						break;
					case "addUser":
						var _user = msg.data;
						room.users.push($.extend(_user,{ vote: null }));
						break;
					case "updateUser":
						//set me...
						if (user.id == msg.data.id) {
							for (var key in msg.data) {
								if (user.get(key) != undefined) {
									user.set(key, msg.data[key]);
								}
							}
						}
						//set user in array
						$.each(room.users, function (idx, _user) {
							if (_user.id == msg.data.id) {
								for (var key in msg.data) {
									if (_user.get(key) != undefined) {
										_user.set(key, msg.data[key]);
									}
								}
							}
						});
						break;
					case "deleteUser":
						room.set("users", $.grep(room.users, function (_user) {
							return _user.id != msg.data.id;
						}));
						break;
					case "vote":
						$.each(room.users, function (idx, _user) {
							if (_user.id == msg.data.id) {
								//did i just vote?
								if (_user.id == user.id) {
									user.set("vote", msg.data.vote);
								}
								//set vote in array
								_user.set("vote",msg.data.vote);
							}
						});
						break;
                }
				room.trigger("change");
				room.users.trigger("change");
			},	
			
			_loadRoomType: function () {
				var _room = this.get("oRoom");
				var _user = this.get("oUser");
				var node = this._node.find("#roomgui");
				//load room type
				if (_room && _user) {
					switch (_room.type) {
						case "vm":
							kendo.ui.progress(node, true);
							window.app.load(node, "rooms/voteme", { room: _room, user: _user }).then(function () {
								kendo.ui.progress(node, false);
							});
							break;
						default:
							kendo.ui.progress(node, true);
							window.app.load(node, "rooms/planningpoker", { room: _room, user: _user }).then(function () {
								kendo.ui.progress(node, false);
							});
							break;
					}
				}
			}
		};	
	}
);