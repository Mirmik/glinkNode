var ModuleClass = require("./ModuleClass.js");
var ImplementationClass = require("./ImplementationClass.js");

var __globalModuleLibrary = undefined;

function Module(name, args) {
	var mod = new ModuleClass(name, args);
	if (__globalModuleLibrary) __globalModuleLibrary.addModule(mod);
}

function Implementation(name, impl, args) {
	var mod = new ImplementationClass(name, impl, args);
	if (__globalModuleLibrary) __globalModuleLibrary.addModule(mod);
}

function setGlobalModuleLibrary(mlib) {
	__globalModuleLibrary = mlib;
}

function globalModuleLibrary(mlib) {
	return __globalModuleLibrary;
}

module.exports.Module = Module;
module.exports.Implementation = Implementation;
module.exports.setGlobalModuleLibrary = setGlobalModuleLibrary;
module.exports.globalModuleLibrary = globalModuleLibrary;