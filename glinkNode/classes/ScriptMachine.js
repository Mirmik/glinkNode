var path = require("path")
var fs = require("fs")
var vm = require("vm")

var ScriptMachine = {}

ScriptMachine.__evalFile = function (file, context, coding) {
	if (coding == undefined) coding = 'utf-8'

	var oldFileName = this.currentFile
	var oldDirName = this.currentDir

	var resolve = path.resolve(this.currentDir, file)
	this.currentFile = resolve
	this.currentDir = path.dirname(this.currentFile)
	var contents = fs.readFileSync(resolve, coding)
	vm.runInNewContext(contents,this.context,resolve)

	this.currentFile = oldFileName
	this.currentDir = oldDirName
} 

ScriptMachine.evalFile = function(file) {
	if (Array.isArray(file)) {
		file.forEach(function(file) {
			this.__evalFile(file, this.context)		
		}, this)
	}
	else this.__evalFile(file, this.context)
}

ScriptMachine.setContext = function(context) {
	this.context = context
}

ScriptMachine.findInTree = function(root,pattern, hide) {
	var result = []
	
	recursiveFind = (dir, pattern, hide) => {
		//console.log(dir)
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

//ScriptMachine.evalScriptsInTree = function(root, pattern, hidepattern) {
//}

ScriptMachine.construct = function() {
	var script = {}
	script.currentFile = ""
	script.currentDir = process.env.PWD
	script.context = {}
	script.__proto__ = ScriptMachine
	return script
}

exports.construct = ScriptMachine.construct