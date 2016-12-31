var File = require("./File.js");
var fs = require("fs");
var path = require("path");

function FileCache() {
	this.cache = {};
}

FileCache.prototype.addFile = function(file) {
	if (!(file instanceof File)) throw "FileCache error";
	this.cache[file.path] = file;
};

FileCache.prototype.getFile = function(path) {
	if (this.cache[path] != undefined) return this.cache[path];
	return this.updateFile(path);
};

FileCache.prototype.updateFile = function(path) {
	this.cache[path] = new File(path);
	return this.cache[path];
};

module.exports = FileCache