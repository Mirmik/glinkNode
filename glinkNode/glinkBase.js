var ruleops = require("./lib/ruleops.js");
var text = require("./lib/text.js");
var ScriptMachine = require("./classes/ScriptMachine.js");
var Glink = require("./classes/Glink.js");
var ModuleLibrary = require("./classes/ModuleLibrary.js");

glinkScript = "./glink.js"

script = new ScriptMachine;

Glink.setGlobalModuleLibrary(new ModuleLibrary(script));

script.evalFile(glinkScript, {
	ARGV : process.argv.slice(2),
	console : console,
	require : require,
	path : require("path"),
	ruleops : ruleops,
	process : process,
	text : text,
	ModuleLibrary : ModuleLibrary,
	ScriptMachine : require("./classes/ScriptMachine.js"),
	CXXModuleCompiler : require("./classes/CXXModuleCompiler.js"),
	ModuleClass : require("./classes/ModuleClass.js"),
	ImplementationClass : require("./classes/ImplementationClass.js"),
	depends : require("./lib/depends.js"),
	script : script,
	Module : Glink.Module,
	Implementation : Glink.Implementation,
	setGlobalModuleLibrary : Glink.setGlobalModuleLibrary,
	globalModuleLibrary : Glink.globalModuleLibrary,

	Array : Array,
	Object : Object,
})


