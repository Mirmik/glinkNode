var path = require("path");
var fs = require("fs");
var vm = require("vm");

var File = require("./File.js");

var copyFuncs = require("../lib/copyFuncs.js");

function ScriptMachine() {
	this.currentFile = "";
	this.currentDir = process.env.PWD;
	this.mtime = null;
	this.context = {};
	this.fileDependiesArray = [];
}

ScriptMachine.prototype.__evalFile = function (file, context, coding) {
	if (coding == undefined) coding = 'utf-8';

	var oldFileName = this.currentFile;
	var oldDirName = this.currentDir;

	var resolve = path.resolve(this.currentDir, file);
	if (!fs.existsSync(resolve)) {
		console.log("File is not exist");
		process.exit(1);
	}

	//Добавляем файл в стэк зависимостей.
	var file = new File(resolve);
	var oldmtime = this.mtime;
	this.fileDependiesArray.push(file);
	
	if (file.mtime > this.mtime) this.mtime = file.mtime;

	//console.log(this.mtime)
	//console.log("ddd")
	
	this.currentFile = resolve;
	this.currentDir = path.dirname(this.currentFile);
	var contents = fs.readFileSync(resolve, coding);
	vm.runInNewContext(contents,context,resolve);
	
	//Очищаем файл из стэка зависимостей.
	this.fileDependiesArray.splice(this.fileDependiesArray.length - 1, 1);

	this.mtime = oldmtime;
	this.currentFile = oldFileName;
	this.currentDir = oldDirName;
} 

ScriptMachine.prototype.evalFile = function(file, context) {
	var copycontext = copyFuncs.copyObject(context);

	if (Array.isArray(file)) {
		file.forEach(function(file) {
			this.__evalFile(file, copycontext);		
		}, this)
	}
	else this.__evalFile(file, copycontext);
}

//ScriptMachine.prototype.setContext = function(context) {
//	this.context = context
//}

ScriptMachine.prototype.findInTree = function(root,pattern, hide) {
	var result = []
	
	recursiveFind = (dir, pattern, hide) => {
		var flist = fs.readdirSync(dir).map((file) => { return path.join(dir, file) })

		var files = []
		var dirs = []

		flist.forEach(function(file){
			if(fs.statSync(file).isFile()) files.push(file)
			else dirs.push(file)
		})		

		dirs.filter(function(dir) {return !hide.test(dir) })
			.forEach(function(dir) {recursiveFind(dir,pattern,hide)})
		
		flist.filter(function(file) {return pattern.test(file) })
		.forEach(function(file){
			result.push(file)
		})
	}

	recursiveFind(root,pattern,hide)
	return result 
}

ScriptMachine.prototype.exit = function() { 
	process.exit(0);
}

module.exports = ScriptMachine