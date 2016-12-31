text = require("../lib/text.js")
path = require("path")
assert = require("assert")
copyFuncs = require("../lib/copyFuncs.js")
ModuleClass = require("./ModuleClass.js")
Implementation = require("./ImplementationClass.js")
VariantModuleClass = require("./VariantModuleClass.js")

function ModuleLibrary(script) {
	this.script = script
	this.moduleList = {}		
}

ModuleLibrary.prototype.restorePathArray = function(array, dir) { 
	if (array == undefined) return;
	for (var i = 0; i < array.length; i++) {
		array[i] = path.resolve(dir, array[i]);
	}
}

ModuleLibrary.prototype.moduleInternalRoutine = function(Mod) {
	var mod = Mod.mod;

	if (mod.opts == undefined) mod.opts = {};
	if (mod.sources == undefined) mod.sources = {};
	if (mod.sources.cxx == undefined) mod.sources.cxx = [];
	if (mod.sources.cc == undefined) mod.sources.cc = [];
	if (mod.sources.s == undefined) mod.sources.s = [];

	Mod.setMtime(script.mtime);
	Mod.moduleDirectory = this.script.currentDir;

	this.restorePathArray(mod.opts.includePaths, Mod.moduleDirectory);
	this.restorePathArray(mod.opts.ldscripts, Mod.moduleDirectory);
	
	this.restorePathArray(mod.sources.cxx, Mod.moduleDirectory);
	this.restorePathArray(mod.sources.cc, Mod.moduleDirectory);
	this.restorePathArray(mod.sources.s, Mod.moduleDirectory);
}

ModuleLibrary.prototype.addModule = function(mod) {
	if (mod instanceof ModuleClass) {
		this.moduleInternalRoutine(mod);
		if (this.moduleList[mod.name] != undefined) throw "ModuleClass's name conflict";
		this.moduleList[mod.name] = mod;
		return;
	}

	if (mod instanceof Implementation) {
		this.moduleInternalRoutine(mod.module);		
		//console.log("add Implementation");
		if (this.moduleList[mod.module.name] == undefined) {
			this.moduleList[mod.module.name] = new VariantModuleClass(mod.module.name);
		}

		if (this.moduleList[mod.module.name] != undefined) 
			if (this.moduleList[mod.module.name] instanceof VariantModuleClass) {
				this.moduleList[mod.module.name].addImplementation(mod);
			} else throw "ModuleClass's name conflict";

		return;
	}
}

ModuleLibrary.prototype.moduleCopy = function(original) {
	var clone = {}
	clone.mod = {}

	function f(cln, obj) {
		var i, keys = Object.getOwnPropertyNames(obj);
		for (i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (Array.isArray(obj[key])) {
				cln[key] = obj[key].slice();
			}
			else if (typeof(obj[key]) === "object") {
				cln[key] = {}
				f(cln[key], obj[key]); 		
			}
			else cln[key] = obj[key];
		}
	}

	f(clone.mod,original.mod)
	clone.__proto__ = original.__proto__;
	clone.mtime = original.mtime;
	clone.name = original.name;
	clone.moduleDirectory = original.moduleDirectory;
	return clone;
}

ModuleLibrary.prototype.getModule = function(name) {
	var rec = this.getModuleRecord(name);
	return this.moduleCopy(rec);
}

ModuleLibrary.prototype.getRealModule = function(name,impl) {
	var rec = this.getRealModuleRecord(name, impl);
	return this.moduleCopy(rec);
}

ModuleLibrary.prototype.getModuleRecord = function(name) {
	var ret = this.moduleList[name];
	if (!ret) {
		console.log(`${text.red("Попытка получения несуществующего модуля")} ${text.yellow(name)}.`);
		process.exit(1);
	}
	return ret;
}

ModuleLibrary.prototype.getRealModuleRecord = function(name,impl) {
	var mod = this.getModuleRecord(name);
	
	var ret;
	if (mod instanceof ModuleClass) {
		if (impl != undefined) throw "This module dont have implementations";
		return mod;
	}

	if (mod instanceof VariantModuleClass) {
		//console.log("VARIANTMODULE")
		if (impl == undefined) throw "This module need to implementation";
		ret = mod.getImplementation(impl);
		if (ret == undefined) throw "Implementation is not released";
		//console.log(ret)
		return ret; 
	}
}

//ModuleLibrary.prototype.getSubmodules = function(mod) {
//	mods = [];
	//console.log(mod)
//	if (mod.getModules() == undefined) return mods;
//	mod.getModules().forEach((sm) => {
//		var submod = this.getModule(sm.name);
		//if (submod == undefined) throw "Undeclared Module in submodules.";
//		mods.push(submod);
//	})
//	return mods;
//}

ModuleLibrary.prototype.resolveSubmod = function(sub) {
	assert(sub.name, "resolveSubmod1");
	
	//console.log(sub);
	var mod = this.getRealModule(sub.name, sub.impl);
	
	//console.log("MOD", mod);
	assert(mod, "resolveSubmod2");
	return mod; 
}

ModuleLibrary.prototype.printModuleList = function() {
	console.log(this.moduleList);
}

ModuleLibrary.prototype.printModule = function(name) {
	console.log(this.moduleList[name]);
}

ModuleLibrary.prototype.printInfo = function(name) {
	var mod = this.moduleList[name];
	if (mod === undefined) console.log(`\t${text.yellow(name)} is undefined module`);
	else if (mod instanceof ModuleClass) {
		console.log(`${text.yellow(name)} is simple module`);	
	} else if (mod instanceof VariantModuleClass) {
		console.log(`${text.yellow(name)} is variant module. Defined implementations:`);
		for (var key in mod.implementations) {
			console.log(`${key}`);
		}
	}
}

ModuleLibrary.prototype.printPackList = function() {
	console.log(this.packList)
}

module.exports = ModuleLibrary