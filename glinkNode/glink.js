var ruleops = require("./lib/ruleops.js")
var text = require("./lib/text.js")

var ScriptMachine = require("./classes/ScriptMachine.js")

glinkScript = "./glink.js"

script = ScriptMachine.construct()

script.setContext ({
	module : module,
	console : console,
	ruleops : ruleops,
	process : process,
	text : text,
	ModuleLibrary : require("./classes/ModuleLibrary.js"),
	ScriptMachine : require("./classes/ScriptMachine.js"),
	CXXModuleCompiler : require("./classes/CXXModuleCompiler.js"),
	script : script
})

script.evalFile(glinkScript)


