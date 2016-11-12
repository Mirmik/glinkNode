var child_process = require("child_process")
var executor = require("./lib/executor.js")
var evalMachine = require("./lib/evalFile.js")
var ruleops = require("./lib/ruleops.js")
var text = require("./lib/text.js")
var make = require("./lib/make.js")
var modmake = require("./lib/modmake.js")

var currentFile = evalMachine.currentFile
var currentDir = evalMachine.currentDir
var evalFile = evalMachine.evalFile

glinkScript = "./glink.js"

var module = function(mod) {
	console.log(mod)
}

var exec = child_process.exec
var execSync = child_process.execSync
var spawn = child_process.spawn

var execTask = require("./lib/task.js").execTask
var build = require("./lib/buildops.js")

GLOBAL.local = "HelloWorld"

var glink = {}

glink.evalFile = function(file) {
	evalFile(file, {
		module : module,
		console : console,
		ruleops : ruleops,
		exec : exec,
		execSync : execSync,
		spawn : spawn,
		process : process,
		text : text,
		execute : executor.execute,
		make : make,
		execTask : execTask,
		build : build,
		modmake : modmake,
		module : modmake.module,
		glink : glink
	})
}

glink.evalScriptsInTree = function(root, pattern, hidepattern) {
	
}

glink.evalFile(glinkScript)

