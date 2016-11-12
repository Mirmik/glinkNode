var path = require("path")
var fs = require("fs")
var vm = require("vm")

var currentFile = ""
var currentDir = process.env.PWD

var evalFile = function (file, context, coding) {
	if (coding == undefined) coding = 'utf-8'

	resolve = path.resolve(currentDir, file)
	currentFile = resolve
	currentDir = path.dirname(currentFile)
	
	var contents = fs.readFileSync(resolve, coding)
	vm.runInNewContext(contents,context,resolve)
} 

exports.evalFile = evalFile
exports.currentFile = currentFile
exports.currentDir = currentDir