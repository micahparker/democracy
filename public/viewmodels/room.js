define(
	[
		'jquery','kendo',
		'model/RoomRepository',
		'_kendo/kendo.listview.min', '_kendo/kendo.window.min',
		'_kendo/kendo.button.min', '_kendo/kendo.numerictextbox.min'
	], 
	function ($,kendo,repo) {
		return {
			sDescription: "",
			sUserName: "",
			bUserActive: true,
			aUsers: [],
			iVote: null,
			bAllVoted: false,
			
			_node: null,
			_room: null,
			_socket: null,
			
			init: function (node, args) {
				var self = this;
				//set vars
				this._node = node;
				this._room = args.n;
				//connect to socket!
				this._socket = new WebSocket("ws://"+location.host.split(":")[0]+":3001/socket?n="+this._room);
				this._socket.onmessage = function(_msg){
					self._incoming(JSON.parse(_msg.data));
				}
				
				return $.when(
					//get room
					repo.read(this._room).then(function(room) {
						self.set("sDescription", room.description);
						self.set("aUsers", room.users);
						//check for all votes
						var allVoted = room.users.length > 0;
						$.each(room.users, function (idx, user) {
							if (user.active && !user.vote) {
								allVoted = false;
							}
						});
						self.set("bAllVoted", allVoted);
					}),
					//ask for name
					repo.readUser(this._room).then(function (user) {
						self.set("sUserName", user.name);
						self.set("sUserActive", user.active);
					}).fail(function () {
						$("#adduser").data("kendoWindow").center().open();
					})
				);
			},
			
			deinit: function () {
				this._socket.close();
				$("#adduser").data("kendoWindow").close().destroy()
			},
			
			_incoming: function (msg) {
				switch (msg.action) {
					case "updateRoom":
						var aUsers = this.get("aUsers");
						if (msg.data.description) {
							this.set("sDescription", msg.data.description);
						}
						//clear votes
						$.each(aUsers, function (idx, user) {
							if (user.id === msg.data.id) {
								user.set("vote",null);
							}
						});
						this.set("bAllVoted", false);
						break;
					case "addUser":
						var user = msg.data;
						this.get("aUsers").push($.extend(user,{ vote: null }));
						break;
					case "updateUserUser":
						$.each(this.get("aUsers"), function (idx, user) {
							if (user.id === msg.data.id) {
								for (var key in msg.data) {
									user.set(key, msg.data[key]);
								}
							}
						});
						break;
					case "deleteUser":
						this.set("aUsers", $.grep(this.get("aUsers"), function (user) {
							return user.id !== msg.data.id;
						}))
						break;
					case "vote":
						var aUsers = this.get("aUsers");
						var allVoted = true;
						$.each(aUsers, function (idx, user) {
							if (user.id === msg.data.id) {
								user.set("vote",msg.data.vote);
							}
							if (user.active && !user.vote) {
								allVoted = false;
							}
						});
						aUsers.trigger("change");
						this.set("bAllVoted", allVoted);
						break;
				}
			},
			
			description_change: function () {
				var self = this;
				kendo.ui.progress(this._node, true);
				repo.update(this._room, { description: this.get("sDescription") }).always(function () {
					kendo.ui.progress(self._node, false)
				});
			},
			
			adduser_click: function () {
				repo.addUser(this._room, this.get("sUserName"), this.get("bUserActive"));
				$("#adduser").data("kendoWindow").close();
			},
			
			vote_click: function () {
				repo.vote(this._room, this.get("iVote"));
			},
			
			list_change: function (e) { 
				var wrapper = $(e.sender.element);
				var items = wrapper.children();
				
			}
		};	
	}
);