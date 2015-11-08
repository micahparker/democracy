requirejs.config({
	paths: {
		"jquery": "//code.jquery.com/jquery-2.1.4.min",
		"_kendo": "//kendo.cdn.telerik.com/2015.3.930/js/",
		"kendo": "//kendo.cdn.telerik.com/2015.3.930/js/kendo.core.min",
		"mokuso": "//rawgit.com/micahparker/mokuso/master/mokuso.min",
		"model": "./models",
		"viewmodel": "./viewmodels",
		"view": "./views"
	},
	map:{
		"*": { "_kendo/kendo.core.min":"kendo"}
	},
	shim: {
		"jquery": { exports: "jQuery" },
		"kendo": { deps: ["jquery"], exports: "kendo" },
		"mokuso": { deps: ["_kendo/kendo.router.min","_kendo/kendo.view.min"], exports: "mokuso" }
	},
	deps: ["jquery","kendo","mokuso"],
	callback: function ($,kendo, Mokuso) {
		var _initial = "create";
		if ($.trim(location.hash).length) {
		_initial = "room?n="+location.hash.replace("#","");
		if (location.hash.indexOf("?n=") > 0) {
			_initial = location.hash.replace("#","");
		}
		}
		window.app = new Mokuso($("#content"), { initial: _initial });
	}
}); 