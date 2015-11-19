define(
	[
		'jquery','kendo',
		'model/roomrepository', 
		'_kendo/kendo.listview.min', '_kendo/kendo.button.min', '_kendo/kendo.numerictextbox.min'
	], 
	function ($,kendo,repo) {
		return {
			oRoom: { description: "", users: [] },
			oUser: { name: "", active: false, vote: null },
			
			iVote: null,
            iAvg: 0,
			bAllVoted: false,
			
			_node: null,
			
			init: function (node, args) {
				var self = this;
				//set vars
				this._node = node;
				this.set("oRoom", args.room);
				this.set("oUser", args.user);
				//setup listener
				args.room.bind("change", function () {
					self._checkVotes();
				});
				this._checkVotes();
			},
			
			description_change: function () {
				var self = this;
				kendo.ui.progress(this._node, true);
				repo.update(this.get("oRoom").name, { description: this.get("oRoom").description }).always(function () {
					kendo.ui.progress(self._node, false)
				});
			},
			
			vote_click: function () {
				repo.vote(this.get("oRoom").name, this.get("iVote"));
			},
			
			_checkVotes: function () {
                var sum = 0;
                var activeUsers = 0;
				var users = this.get("oRoom").users;
				//check for all votes
				var allVoted = users.length > 0;
				$.each(users, function (idx, user) {
                    if (user.active) {
                        sum += parseInt(user.vote);
                        if (!user.vote) {
                            allVoted = false;
                        }
                        activeUsers++;
					}
                });
                this.set("iAvg", (activeUsers == 0 ? 0 : (sum / activeUsers)));	
                this.set("bAllVoted", allVoted);	
			}
		};	
	}
);