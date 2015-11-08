define(
	[
		'jquery','kendo',
		'model/RoomRepository', 
		'_kendo/kendo.button.min'
	], 
	function ($,kendo,repo) {
		return {
			sRoomName: "",
			
			_node: null,
			
			init: function (node) {
				this._node = node;
			},
			
			create_click: function (e) {
				var self = this;
				kendo.ui.progress(this._node, true);
				repo.create().then(function (room) {
					window.app.navigate('room?n='+room.name);
				}).always(function () {
					kendo.ui.progress(self._node, false);
				})
			}
		};	
	}
);