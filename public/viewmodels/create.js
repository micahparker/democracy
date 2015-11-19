define(
	[
		'jquery','kendo',
		'model/roomrepository', 
		'_kendo/kendo.button.min'
	], 
	function ($,kendo,repo) {
		return {
			sRoomName: "",
			
			_node: null,
			
			init: function (node) {
				this._node = node;
			},
			
			create_pp_click: function (e) {
				var self = this;
				kendo.ui.progress(this._node, true);
				repo.create('pp').then(function (room) {
					window.app.navigate('room?n='+room.name);
				}).always(function () {
					kendo.ui.progress(self._node, false);
				})
			},
			
			create_vm_click: function (e) {
				var self = this;
				kendo.ui.progress(this._node, true);
				repo.create('vm').then(function (room) {
					window.app.navigate('room?n='+room.name);
				}).always(function () {
					kendo.ui.progress(self._node, false);
				})
			}
		};	
	}
);