define(
	['jquery', 'kendo'], 
	function ($, kendo) {
		return {
			create: function (_type) {
				return $.ajax({
					url: "/rooms/"+_type,
					method: "POST"
				}).promise();
			},
			read: function (name) {
				return $.ajax({
					url: "/rooms/"+name,
					method: "GET"
				}).promise();
			},
			update: function (name, _data) {
				return $.ajax({
					url: "/rooms/"+name,
					method: "PUT",
					contentType: "application/json",
					data: kendo.stringify(_data),
					processData: false
				}).promise();
			},
			readUser: function (roomName) {
					return $.ajax({
						url: "/rooms/"+roomName+"/user",
						method: "GET"
					}).promise();
			},
			addUser: function (roomName, _name, _active) {
				return $.ajax({
					url: "/rooms/"+roomName+"/user",
					method: "POST",
					contentType: "application/json",
					data: kendo.stringify({ name: _name, active: _active }),
					processData: false
				}).promise();
			},
			deleteUser: function (roomName, id) {
				return $.ajax({
					url: "/rooms/"+roomName+"/user/"+id,
					method: "DELETE"
				}).promise();
			},
			vote: function (roomName, vote) {
				return $.ajax({
					url: "/rooms/"+roomName+"/vote/"+vote,
					method: "POST"
				}).promise();
			}
		}
	}
)