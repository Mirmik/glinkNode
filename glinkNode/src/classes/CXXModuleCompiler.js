/*Nodejs library*/
var path = require("path");
var fs = require("fs");
var child_process = require("child_process");
var assert = require("assert");

/*Nodejs library's functions*/
var exec = child_process.exec;
var execSync = child_process.execSync;

/*Glink library*/
var base64 = require("../lib/base64.js").base64;
var depends = require("../lib/depends.js");
var recursiveMkdir = require("../lib/recursiveMkdir.js").recursiveMkdir;
var ruleops = require("../lib/ruleops.js");

/*Glink classes library*/
var FileCache = require("./FileCache.js");
var Glink = require("./Glink.js");

/*CXX compiler constructor
@args: {
Buildutils for current project:
	buildutils : {CXX : #arg, CC : #arg, AR : #arg, OBJDUMP : #arg},
Build directory path:
	[builddir : #arg],
}*/
function CXXModuleCompiler(args) {
	assert(args.buildutils, "Need buildutils property in CXXModuleCompiler constructor's args");
	assert(args.buildutils.CXX, "Need CXX property in buildutils");
	assert(args.buildutils.CC, "Need CC property in buildutils");
	assert(args.buildutils.AR, "Need AR property in buildutils");
	assert(args.buildutils.OBJDUMP, "Need OBJDUMP property in buildutils");
	assert(args.opts, "Need opts property in CXXModuleCompiler constructor's args");

	//Set default builddir if needed.
	this.builddir = args.builddir || path.resolve(process.env.PWD, "build");

	//We use FileCache as file operations manager.
	this.fileCache = new FileCache;
	this.opts = args.opts;

	if (!Array.isArray(this.opts.options.all)) this.opts.options.all = this.opts.options.all.split(' ');
	if (!Array.isArray(this.opts.options.cxx)) this.opts.options.cxx = this.opts.options.cxx.split(' ');
	if (!Array.isArray(this.opts.options.cc)) this.opts.options.cc = this.opts.options.cc.split(' ');
	if (!Array.isArray(this.opts.options.ld)) this.opts.options.ld = this.opts.options.ld.split(' ');

	this.opts.options.cxx = this.opts.options.cxx.concat(this.opts.options.all);
	this.opts.options.cc = this.opts.options.cc.concat(this.opts.options.all);
	this.opts.options.ld = this.opts.options.ld.concat(this.opts.options.all);

	//Compiler rules prototypes.
	this.rules = ruleops.substitute({
		cxx_rule : "%CXX -c %src -o %tgt %__options__",
		cc_rule : "%CC -c %src -o %tgt %__options__",
		s_rule : "%CC -c %src -o %tgt %__options__",
		cxx_dep_rule : "%CXX -MM %src > %tgt %__options__",
		cc_dep_rule : "%CC -MM %src > %tgt %__options__",
		s_dep_rule : "%CC -MM %src > %tgt %__options__",
		ld_rule : "%CXX %objs -o %tgt %__options__",
		__options__ : "%STANDART %OPTIMIZATION %DEFINES %INCLUDE %LIBS %OPTIONS",
		__link_options__ : "%OPTIMIZATION %LIBS %LDSCRIPTS %OPTIONS",
	}, args.buildutils);

	//We use global context as default.
	this.setModuleLibrary(Glink.globalModuleLibrary());
}

/*UTILITY METHODS*/

//Restore absolute paths of array's list.
CXXModuleCompiler.prototype.restorePathArray = function(array, dir) { 
	if (array == undefined) return;
	for (var i = 0; i < array.length; i++) {
		array[i] = path.resolve(dir, array[i]);
	}
}

//Construct merged object from a and b.
CXXModuleCompiler.prototype.mergeObject = function(a, b) {
	var res = {}
	Object.assign(res, a);

	if (!b) return res;

	var i, keys = Object.getOwnPropertyNames(b);
	for (i = 0; i < keys.length; i++) {
		var key = keys[i];
		if (a[key] == undefined) {
			res[key] = b[key];
		}
		else if (Array.isArray(a[key])) {
			if (b[key] === undefined) {} 
			else if (Array.isArray(b[key])) {
				res[key] = a[key].concat(b[key]);
 			}
 			else throw "mergeObject Error::1"
		}
		else if (typeof(a[key]) === "object") {
			if (b[key] === undefined) {} 
			else if (typeof(b[key]) === "object") {
				res[key] = this.mergeObject(a[key], b[key]);
			}
 			else throw "mergeObject Error::2"
		}
		else res[key] = b[key];
	}
	return res;
}

/*BUILD DIRECTORY OPERATIONS*/

/*Create build directory if needed*/
CXXModuleCompiler.prototype.updateBuildDirectory = function() {
	recursiveMkdir(this.builddir);
}

/*Unlink all files in build directory*/
CXXModuleCompiler.prototype.cleanBuildDirectory = function() {
	if (!fs.existsSync(this.builddir)) {return;}
	var flist = fs.readdirSync(this.builddir).map((file) => { 
		return path.join(this.builddir, file) 
	})
	flist.map((file) => { return fs.unlinkSync(file); });
}

/*OPTIONS OPERATIONS*/

CXXModuleCompiler.prototype.resolveOptions3 = function(o,n,t) {
	var opts = {}
	Object.assign(opts,o)

	if (opts.includePaths == undefined) opts.includePaths = [];

	if (n != undefined) {
		opts = this.mergeObject(opts, n)
	};

	if (t != undefined) {
		opts = this.mergeObject(opts, t)
	};

	return opts;
}

CXXModuleCompiler.prototype.resolveOptions2 = function(o,n) {
	var opts = {}
	Object.assign(opts,o)

	if (opts.includePaths == undefined) opts.includePaths = [];

	if (n != undefined) {
		opts = this.mergeObject(opts, n)
	};

	return opts;
}

/*RULES OPERATIONS*/

CXXModuleCompiler.prototype.resolveODRule = function(protorules, opts) {
	assert(protorules);

	var tempoptions = ruleops.substitute(protorules.__options__, {
		OPTIMIZATION : opts.optimization,
		LIBS : opts.libs.join(" "),
		INCLUDE : opts.includePaths.map((file)=>{return "-I"+file;}).join(" "),
		DEFINES : opts.defines.join(" "),
	})

	var cc_options = ruleops.substitute(tempoptions, {
		STANDART : opts.standart.cc,
		OPTIONS : opts.options.cc.join(" "),
	})

	var cxx_options = ruleops.substitute(tempoptions, {
		STANDART : opts.standart.cxx,
		OPTIONS : opts.options.cxx.join(" "),
	})

	var ret = {};
	ret.cc_rule = ruleops.substitute(protorules.cc_rule, {__options__: cc_options});
	ret.cc_dep_rule = ruleops.substitute(protorules.cc_dep_rule, {__options__: cc_options});
	ret.cxx_rule = ruleops.substitute(protorules.cxx_rule, {__options__: cxx_options});
	ret.cxx_dep_rule = ruleops.substitute(protorules.cxx_dep_rule, {__options__: cxx_options});

	return ret;
}

CXXModuleCompiler.prototype.resolveLinkRule = function(protorules, opts) {
	assert(protorules);

	if (!opts.optimization) opts.optimization = "-O2"
	if (!opts.ldscripts) opts.ldscripts = []

	var tempoptions = ruleops.substitute(protorules.__link_options__, {
		OPTIMIZATION : opts.optimization,
		LIBS : opts.libs.join(" "),
		LDSCRIPTS : opts.ldscripts.map((file)=>{return "-T"+file;}).join(" "),
		OPTIONS : opts.options.ld.join(" "),
	})
	
	var ret = {};
	ret.ld_rule = ruleops.substitute(protorules.ld_rule, {__options__: tempoptions});
	
	return ret;
}

/*FILES OPERATIONS*/

CXXModuleCompiler.prototype.dependCreate = function(sourcefile, dependfile, rule) {
	if (rule == undefined) throw "dependCreate::RuleError"
	rule = ruleops.substitute(rule, {
		src : sourcefile.path,
		tgt : dependfile.path
	})
	
	if (this.debugInfo) console.log("DEPEND\t", rule)
	
	try {
		var result = execSync(rule);
	}
	catch (e) {
		process.exit(1);
	}
	
	this.fileCache.updateFile(dependfile.path);
}

/*dependUpdate
	Обновления файла зависимостей.
	@path адрес source файла
	@rule правила сборки файла зафисимостей.
	@modmtime время изменения файла скрипта (модуля)
*/
CXXModuleCompiler.prototype.dependUpdate = function(path, rule, modmtime, weak) {
	var sourcefile = this.fileCache.getFile(path);
	var dependfile = this.fileCache.getFile(this.builddir + "/" + base64(path) + ".d");

	if (depends.needToRecompile(dependfile, modmtime, this.fileCache, weak)) {
		//this.dependCreate(sourcefile, dependfile, rule);
		return true;
	}
	else return false;
}

CXXModuleCompiler.prototype.objectCreate = function(sourcefile, objectfile, dependfile, rule, deprule) {
	if (rule == undefined) throw "objectCreate::RuleError"
	rule = ruleops.substitute(rule, {
		src : sourcefile.path,
		tgt : objectfile.path
	})
	
	if (this.debugInfo) console.log("OBJECT\t", rule);
	else console.log("OBJECT\t", sourcefile.path);
	
	try {
		var result = execSync(rule);
		this.dependCreate(sourcefile, dependfile, deprule),
		this.fileCache.updateFile(dependfile.path);
	}
	catch (e) {
		dependfile.remove()
		this.fileCache.updateFile(dependfile.path);
		process.exit(1);
	}
	
	this.fileCache.updateFile(objectfile.path);
}

CXXModuleCompiler.prototype.objectUpdate = function(path, deprule, objrule, modmtime, weak) {
	var sourcefile = this.fileCache.getFile(path);
	var objectfile = this.fileCache.getFile(this.builddir + "/" + base64(path) + ".o");

	if (this.dependUpdate(path, deprule, modmtime, weak)) {
		var dependfile = this.fileCache.getFile(this.builddir + "/" + base64(path) + ".d");
		this.objectCreate(sourcefile, objectfile, dependfile, objrule, deprule);
	}

	return objectfile.path;
}

CXXModuleCompiler.prototype.executableCreate = function(objectfiles, objects, targetfile, rule) {
	if (rule == undefined) throw "objectCreate::RuleError"
	
	rule = ruleops.substitute(rule, {
		objs : objects.join(" "),
		tgt : targetfile.path
	})
	
	if (this.debugInfo) console.log("LINK\t", rule);
	else console.log("LINK\t", targetfile.path);
	
	try {
		var result = execSync(rule);
	}
	catch (e) {
		process.exit(1);
	}
	
	this.fileCache.updateFile(targetfile.path);
}

CXXModuleCompiler.prototype.executableUpdate = function(objects, target, ldrule, modmtime, weak) {
	var objectfiles = [];
	objects.forEach((obj) => objectfiles.push(this.fileCache.getFile(obj)), this);

	var targetfile = this.fileCache.getFile(target);

	var maxMtime = (weak === "noscript") ? null : modmtime;
	objectfiles.forEach((obj) => {
		if (obj.mtime > maxMtime) maxMtime = obj.mtime;
	});

	if (!targetfile.exists || maxMtime > targetfile.mtime) {
		this.executableCreate(objectfiles, objects, targetfile, ldrule);
		return targetfile.path;
	}

	return false;
}

/*MODARRAY OPERATIONS AND CHECKERS*/

CXXModuleCompiler.prototype.getAllModuleNames = function(modarray) {
	var names = [];
	modarray.forEach((mod) => names.push(mod.name));
	return names;
};

CXXModuleCompiler.prototype.getAllDependsNames = function(modarray) {
	var depends = [];
	modarray.forEach((mod) => {
		if (mod.mod.depends) mod.mod.depends.forEach((dep) => {
			depends.push({mod,dep});
		});	
	});
	return depends;
};

CXXModuleCompiler.prototype.checkModuleArrayDepends = function(modarray) {
	var nams = this.getAllModuleNames(modarray);
	var deps = this.getAllDependsNames(modarray);

	deps.forEach((dep) => {
		if (nams.indexOf(dep.dep) === -1) {
			console.log(`${text.red("Unresolved depend:")} ${text.yellow(dep.mod.name)} needs ${text.yellow(dep.dep)}`);
			this.mlib.printInfo(dep.dep);
			process.exit(1);
		}
	})
}

CXXModuleCompiler.prototype.checkModuleOptions = function(modarray) {
	modarray.forEach((mod) => {
		switch (mod.__opts.weakRecompile) {
			case "noscript": break; 
			case "norecompile": break;
			case undefined: break;
			default : {
				console.log(`Wrong ${text.yellow("weakRecompile")} option value. ${text.red(mod.__opts.weakRecompile)}`);
				console.log("It can be: 'noscript', 'norecompile', undefined.");
				process.exit(1);
			}
		}
	})
}

CXXModuleCompiler.prototype.moduleTreeToArray = function(mod) {
	var array = [mod];
	function f(mod) {
		mod.__submods.forEach((sub) => {
			array.push(sub);
			f(sub);
		}, this);
	}	
	f(mod);
	return array;
}

/*MODULES AND OBJECTS OPERATIONS*/

CXXModuleCompiler.prototype.__updateModObjects = function(mod) {
	assert(mod);
	var odRules = this.resolveODRule(this.rules, mod.__opts); 

	var weak = mod.__opts.weakRecompile;  

	var sources = mod.getSources();
	var objects = [];

	if (sources.s) 
		sources.s.map((file) => {
			objects.push(this.objectUpdate(file, odRules.cc_dep_rule, odRules.cc_rule, mod.getMtime(), weak));
		});

	if (sources.cc) 
		sources.cc.map((file) => {
			objects.push(this.objectUpdate(file, odRules.cc_dep_rule, odRules.cc_rule, mod.getMtime(), weak));
		});

	if (sources.cxx) 
		sources.cxx.map((file) => {
			objects.push(this.objectUpdate(file, odRules.cxx_dep_rule, odRules.cxx_rule, mod.getMtime(), weak));
		});

	return objects;
}

CXXModuleCompiler.prototype.__assembleObjects = function(mod, objects) {
	var linkRule = this.resolveLinkRule(this.rules, mod.__opts).ld_rule;
	//console.log(mod.__opts.target);

	var target = mod.__opts.target || "target";

	this.restorePathArray(mod.getOpts().ldscripts, mod.moduleDirectory)

	var executable = this.executableUpdate(objects, target, linkRule, mod.getMtime(), mod.__opts.weakRecompile);
	return executable;
}

CXXModuleCompiler.prototype.moduleStateRestore = function(mod) { 
	/*Restore Opts State.*/
	var opts = mod.getOpts();
	
	if (opts == undefined) {
		mod.mod.opts = {};
		opts = mod.mod.opts;
	}

	if (!opts.optimization) opts.optimization = "-O2"
	if (!opts.ldscripts) opts.ldscripts = []
	if (!opts.libs) opts.libs = []
	if (!opts.defines) opts.defines = []
	if (!opts.includePaths) opts.includePaths = []
	if (!opts.options) opts.options = {}
	if (!opts.options.all) opts.options.all = []
	if (!opts.options.cxx) opts.options.cxx = []
	if (!opts.options.cc) opts.options.cc = []
	if (!opts.options.ld) opts.options.ld = []

	this.restorePathArray(opts.includePaths, mod.moduleDirectory);
	this.restorePathArray(opts.ldscripts, mod.moduleDirectory);

	if (!Array.isArray(opts.options.all)) opts.options.all = opts.options.all.split(' ');
	if (!Array.isArray(opts.options.cxx)) opts.options.cxx = opts.options.cxx.split(' ');
	if (!Array.isArray(opts.options.cc)) opts.options.cc = opts.options.cc.split(' ');
	if (!Array.isArray(opts.options.ld)) opts.options.ld = opts.options.ld.split(' ');

	opts.options.cxx = opts.options.cxx.concat(opts.options.all);
	opts.options.cc = opts.options.cc.concat(opts.options.all);
	opts.options.ld = opts.options.ld.concat(opts.options.all);

	/*Restore Sources State.*/
	var sources = mod.getSources();
	
	if (sources == undefined) {
		mod.mod.sources = {};
		sources = mod.mod.sources;
	}

	if (!sources.cxx) sources.cxx = [];
	if (!sources.cc) sources.cc = [];
	if (!sources.s) sources.s = [];

	if (!Array.isArray(sources.cxx)) sources.cxx = sources.cxx.split(' ');
	if (!Array.isArray(sources.cc)) sources.cc = sources.cc.split(' ');
	if (!Array.isArray(sources.s)) sources.s = sources.s.split(' ');

	var sourcesDirectory = 
		sources.directory ? 
		path.resolve(mod.moduleDirectory, sources.directory) : 
		mod.moduleDirectory; 

	this.restorePathArray(sources.cxx, sourcesDirectory);
	this.restorePathArray(sources.cc, sourcesDirectory);
	this.restorePathArray(sources.s, sourcesDirectory);
}

CXXModuleCompiler.prototype.addOptsStateRestore = function(addopts, mod) { 
	if (addopts) {
		if (addopts.target) addopts.target = path.resolve(mod.moduleDirectory, addopts.target); 
		this.restorePathArray(addopts.includePaths, mod.moduleDirectory);
		this.restorePathArray(addopts.ldscripts, mod.moduleDirectory);
	}
}

CXXModuleCompiler.prototype.resolveIncludeModules = function(mod) {
	var incmodsrec = mod.mod.includeModules;
	if (incmodsrec === undefined) return;

	var incmods = [];
		
	/*Create all includeModules copies.*/
	incmodsrec.forEach((inc) => {
		incmods.push(this.mlib.getRealModule(inc.name, inc.impl));
	},this);

	/*For each included module:*/
	incmods.forEach((inc) => {
		this.moduleStateRestore(inc);

		//If inc have own includeModules, resolve these.
		this.resolveIncludeModules(inc);

		//Merge included module to mod and change mtime, if needed. 
		mod.mod = this.mergeObject(mod.mod, inc.mod);
		if (mod.getMtime() < inc.getMtime()) mod.setMtime(inc.getMtime());
	},this);	

	mod.mod.includeModules = undefined;
}

/*This operation construct module array for compile ops.
@mod - Main module. Root of tree.
@addopts - module's added options*/
CXXModuleCompiler.prototype.prepareModuleArray = function(mod, addopts) {
	var __this = this;

	/*Worker*/
	function f(mod, parentopts, addopts) {
		/*Add all relative paths to absolute.
		We use moduleDirectory field's information to this*/
		__this.moduleStateRestore(mod);
		__this.addOptsStateRestore(addopts, mod);		

		/*Apply include modules. It's first operation, because submodules
		should include all include modules's paths and depends.*/
		__this.resolveIncludeModules(mod);

		
		/*Resolve opts struct. It contains opts: parent, module, added*/
		mod.__opts = __this.resolveOptions3(parentopts, mod.getOpts(), addopts);

		/*We need submodule's field for tree organization*/
		mod.__submods = []
		if (!mod.getModules()) return;

		//If mod have submodules, foreach
		mod.getModules().forEach((subrec) => {
			//get submodule from library
			var sub = __this.mlib.resolveSubmod(subrec);
			//add to submodules field.
			mod.__submods.push(sub);
			//use Worker on it.
			f(sub, mod.__opts, subrec.opts);
		}, this);
	}	

	//Invoke worker for main module
	f(mod, this.opts, addopts);

	/*Result of worker's recursive invoke is module's tree.
	This function expand it to array*/
	var modarray = this.moduleTreeToArray(mod)
	
	return modarray;
}

/*EXTERNAL API*/

/*Main executable assemle method
@name - name of assembled module
@addopts - module's added options*/
CXXModuleCompiler.prototype.assembleModule = function(name, addopts) {
	//Get module from library.
	var mod = this.mlib.getModule(name);

	/*Main prepare operation.
	In this operation we restore and resolve opts structs.
	Function returns module array, that ready to compile operation.*/
	var modarray = this.prepareModuleArray(mod, addopts);

	//Check depends of modules.
	this.checkModuleArrayDepends(modarray);
	this.checkModuleOptions(modarray);

	//Compile operation.
	var objects = [];
	modarray.forEach((mod) => {
		var modobjs = this.__updateModObjects(mod);
		objects = objects.concat(modobjs);
	});
	
	//Assemble operation.
	if (objects !== [])
	var ret = this.__assembleObjects(mod, objects);

	//If nothing to do, return false.
	return ret;
}


CXXModuleCompiler.prototype.printModuleList = function() {
	console.log(this.mlib.moduleList)
	return this
}

CXXModuleCompiler.prototype.setModuleLibrary = function(mlib) {
	this.mlib = mlib
	return this
}

CXXModuleCompiler.prototype.getModuleLibrary = function() {
	return this.mlib
}

module.exports = CXXModuleCompiler