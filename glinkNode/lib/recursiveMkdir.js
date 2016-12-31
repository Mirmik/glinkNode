var path = require("path");
var fs = require("fs");
var text = require("../lib/text.js");

function recursiveMkdir(dir) {
	var f = function(dir) {
		if (fs.existsSync(dir)) return;
		
		var parentdir = path.dirname(dir);
		if (!fs.existsSync(parentdir)) f(parentdir);

		console.log("MKDIR\t", path.resolve(process.env.PWD, dir));
		fs.mkdirSync(dir);
	}
	
	f(dir);
}

module.exports.recursiveMkdir = recursiveMkdir  