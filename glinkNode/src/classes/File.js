var fs = require("fs")
var path = require("path")
var util = require("util")

function File(sourcepath) {
//	console.log("File");
	this.path = sourcepath;
	this.ext = path.extname(this.path);
	this.update();
}

File.prototype.update = function() {
	this.exists = fs.existsSync(this.path);
	if (this.exists) {
		this.stat = fs.statSync(this.path);
		this.mtime = this.stat.mtime;
	}
	else {
		this.stat = undefined;
		this.mtime = undefined;
	}
}

File.prototype.remove = function() {
	if (this.exists) fs.unlinkSync(this.path);
}

module.exports = File;