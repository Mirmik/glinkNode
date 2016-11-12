text = require("./text.js")
makecontext = require("./makecontext.js")

moduleList = {}
packList = {}

exports.module = function(mod) {
	if (mod.pack === undefined) mod.pack = ":"
	var fullname = mod.pack + mod.name
	moduleList[fullname] = mod
	console.log("Module " + text.yellow(mod.pack + mod.name) 
		+ " is registred")
	if (packList[mod.pack] === undefined) {
		packList[mod.pack] = [mod]
	} else {
		packList[mod.pack].push(mod)
	}
}

exports.printModuleList = function() {
	console.log(moduleList)
}

exports.printModule = function(name) {
	console.log(moduleList[name])
}

exports.printPackList = function() {
	console.log(packList)
}

exports.cxxCompilerContext = function(vars) {
	context = {__proto__ : makecontext}
	context.constructor(vars)
	context.moduleList = moduleList
	context.packList = packList
	return context
}