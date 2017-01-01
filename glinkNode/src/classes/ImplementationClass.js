var ModuleClass = require("./ModuleClass.js") 

function ImplementationClass(name, impl, mod) {
	this.impl = impl;
	this.module = new ModuleClass(name, mod);
}

module.exports = ImplementationClass;