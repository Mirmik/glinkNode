text = require("../lib/text.js")

var ModuleLibrary = {}

ModuleLibrary.module = function(mod) {
	if (mod.pack === undefined) mod.pack = ":"
	var fullname = mod.pack + mod.name
	this.moduleList[fullname] = mod
	console.log("Module " + text.yellow(mod.pack + mod.name) 
		+ " is registred")
	if (this.packList[mod.pack] === undefined) {
		this.packList[mod.pack] = [mod]
	} else {
		this.packList[mod.pack].push(mod)
	}
}

ModuleLibrary.printModuleList = function() {
	console.log(this.moduleList)
}

ModuleLibrary.printModule = function(name) {
	console.log(this.moduleList[name])
}

ModuleLibrary.printPackList = function() {
	console.log(this.packList)
}

ModuleLibrary.construct = function(script) {
	var mlib = {}
	mlib.script = script
	mlib.moduleList = {}
	mlib.packList = {}
	mlib.__proto__ = ModuleLibrary
	return mlib
}

exports.construct = ModuleLibrary.construct