var ruleops = require("./lib/ruleops.js");
var text = require("./lib/text.js");
var ScriptMachine = require("./classes/ScriptMachine.js");
var Glink = require("./classes/Glink.js");
var ModuleLibrary = require("./classes/ModuleLibrary.js");

var argumentParser = require("./lib/argumentParser.js").argumentParser;

/*
	Default main script address
*/
var glinkScript = './glink.js'

var minimist = require("minimist");

var ARGV = process.argv.slice(2);
var parse = minimist(ARGV);

if (parse.help || parse.h) {
	console.log("Glink makescript. HELP.")
	console.log("-h or --help. Print this text.");
	console.log("-v. Verbose.");
	console.log("--script. Set script address. Default = ./glink.js");
	process.exit(0)
}

if (parse.v) {
	console.log("Glink makescript. Version 0.3");
	process.exit(0);
}

if (parse.script && (parse.script != true)) {
	glinkScript = parse.script;
}

/*
	Create script evaluators.
*/
script = new ScriptMachine;
Glink.setGlobalModuleLibrary(new ModuleLibrary(script));

/*
	Evaluate main script in constructed context.
*/
script.evalFile(glinkScript, {
	ARGV : parse["_"],
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


