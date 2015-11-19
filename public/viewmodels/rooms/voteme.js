define(
	[
		'jquery','kendo',
		'model/roomrepository', 
		'_kendo/kendo.listview.min'
	], 
	function ($,kendo,repo) {
		return {
			oRoom: { description: "", users: [] },
			oUser: { name: "", active: false, vote: null },
			
			_node: null,
			
			init: function (node, args) {
				var self = this;
				//set vars
				this._node = node;
				//reset totals
				this._resetVotes(args.room.users);
				//set more vars...
				this.set("oRoom", args.room);
				this.set("oUser", args.user);
				//set voted
				this._checkVotes();
				args.room.users.trigger("change");
			},
			
			description_change: function () {
				var self = this;
				kendo.ui.progress(this._node, true);
				repo.update(this.get("oRoom").name, { description: this.get("oRoom").description }).always(function () {
					kendo.ui.progress(self._node, false)
				});
			},
			
			vote_click: function (e) {
				var user = this.get("oUser");
				if (user.active && e.data.id != user.id) {
					repo.vote(this.get("oRoom").name, e.data.id);
				}
			},
			
			_checkVotes: function () {
				var self = this;
				var user = this.get("oUser");
				var users = this.get("oRoom").users;
				//reset totals
				this._resetVotes(users);
				//find my vote...
				$.each(users, function (idx, _user) {
					//set my voted
                    if (_user.id == user.vote) {
                        self._node.find("#user_"+_user.id).addClass("voted");
					}
					//add to total for each user
					$.each(users, function (idx, __user) {
						if (_user.vote == __user.id) {
							__user._total += 1;
						}
					});
                });
			},
			
			_resetVotes: function (users) {
				$.each(users, function (idx, _user) {
					_user._total = 0;
				});
			}
		};	
	}
);