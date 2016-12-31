var ruleops = require("../lib/ruleops.js");
var path = require("path");
var fs = require("fs");

var child_process = require("child_process");
var exec = child_process.exec;
var execSync = child_process.execSync;
var FileCache = require("./FileCache.js");
var base64 = require("../lib/base64.js").base64;
var depends = require("../lib/depends.js");

var assert = require("assert");

var recursiveMkdir = require("../lib/recursiveMkdir.js").recursiveMkdir;
var Glink = require("./Glink.js");

function CXXModuleCompiler(args) {
	assert(args.buildutils, "Need buildutils property in CXXModuleCompiler constructor's args");
	assert(args.buildutils.CXX, "Need CXX property in buildutils");
	assert(args.buildutils.CC, "Need CC property in buildutils");
	assert(args.buildutils.AR, "Need AR property in buildutils");
	assert(args.buildutils.OBJDUMP, "Need OBJDUMP property in buildutils");
	assert(args.opts, "Need opts property in CXXModuleCompiler constructor's args");

	this.builddir = args.builddir || path.resolve(process.env.PWD, "build");

	this.fileCache = new FileCache;
	this.opts = args.opts;

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

	this.setModuleLibrary(Glink.globalModuleLibrary());
}

CXXModuleCompiler.prototype.updateBuildDirectory = function() {
	recursiveMkdir(this.builddir);
}

CXXModuleCompiler.prototype.cleanBuildDirectory = function() {
	if (!fs.existsSync(this.builddir)) {return;}
	var flist = fs.readdirSync(this.builddir).map((file) => { return path.join(this.builddir, file) })
	flist.map((file) => { return fs.unlinkSync(file); });
}

CXXModuleCompiler.prototype.restorePathArray = function(array, dir) { 
	if (array == undefined) return;
	for (var i = 0; i < array.length; i++) {
		array[i] = path.resolve(dir, array[i]);
	}
}

CXXModuleCompiler.prototype.restorePathGroup = function(mod,name) { 
//	if (mod.opts) this.restorePathArray(mod.opts[name]); 
//	if (mod.opts.add) this.restorePathArray(mod.opts.add[name]);
//	if (mod.global) this.restorePathArray(mod.global[name]);
}


CXXModuleCompiler.prototype.resolveAddOptions = function(opts,add) {
	if (add == undefined) return;
	
	/*if (!opts.includePaths) opts.includePaths = [];
	if (!opts.ldscripts) opts.ldscripts = [];
	if (!opts.defines) opts.defines = [];

	if (add.includePaths != undefined) opts.includePaths = opts.includePaths.concat(add.includePaths);
	if (add.ldscripts != undefined) opts.ldscripts = opts.ldscripts.concat(add.ldscripts);
	if (add.defines != undefined) opts.defines = opts.defines.concat(add.defines);
	
	if (add.target != undefined) opts.target = opts.target;*/
}

CXXModuleCompiler.prototype.resolveRemoveOptions = function(opts,rem) {
	if (rem == undefined) return;
}

CXXModuleCompiler.prototype.resolveOptions3 = function(o,n,t) {
	var opts = {}
	Object.assign(opts,o)

	if (opts.includePaths == undefined) opts.includePaths = [];

	//console.log("HERE")
	if (n != undefined) {
		opts = this.mergeObject(opts, n)
		//this.resolveAddOptions(opts, n)
		//this.resolveRemoveOptions(opts, n.remove)
	};

	//console.log("HERE2")
	if (t != undefined) {
		opts = this.mergeObject(opts, t)
		//this.resolveAddOptions(opts, t)
		//this.resolveRemoveOptions(opts, t.remove)
	};

	//console.log("OPTS",opts);
	return opts;
}

CXXModuleCompiler.prototype.resolveOptions2 = function(o,n) {
	var opts = {}
	Object.assign(opts,o)

	if (opts.includePaths == undefined) opts.includePaths = [];

	if (n != undefined) {
		this.resolveAddOptions(opts, n)
		//this.resolveRemoveOptions(opts, n.remove)
	};

	return opts;
}

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
CXXModuleCompiler.prototype.dependUpdate = function(path, rule, modmtime) {
	var sourcefile = this.fileCache.getFile(path);
	var dependfile = this.fileCache.getFile(this.builddir + "/" + base64(path) + ".d");

	if (depends.needToRecompile(dependfile, modmtime, this.fileCache)) {
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

CXXModuleCompiler.prototype.objectUpdate = function(path, deprule, objrule, modmtime) {
	var sourcefile = this.fileCache.getFile(path);
	var objectfile = this.fileCache.getFile(this.builddir + "/" + base64(path) + ".o");

	if (this.dependUpdate(path, deprule, modmtime)) {
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

CXXModuleCompiler.prototype.executableUpdate = function(objects, target, ldrule, modmtime) {
	var objectfiles = [];
	objects.forEach((obj) => objectfiles.push(this.fileCache.getFile(obj)), this);

	var targetfile = this.fileCache.getFile(target);

	var maxMtime = modmtime;
	objectfiles.forEach((obj) => {
		if (obj.mtime > maxMtime) maxMtime = obj.mtime;
	});

	if (!targetfile.exists || maxMtime > targetfile.mtime) {
		this.executableCreate(objectfiles, objects, targetfile, ldrule);
		return targetfile.path;
	}

	return false;
}


//CXXModuleCompiler.prototype.objectsUpdate = function(args) {
//	if (args.name == undefined) throw "objectsUpdate without name";
//	if (args.opts == undefined) args.opts = {}; 		
//	var mod = this.mlib.getRealModule(args.name,args.impl);
//	var opts = this.resolveOptions(this.opts, mod.opts, args.opts);
//	console.log(mod);
//}

CXXModuleCompiler.prototype.resolveODRule = function(protorules, opts) {
	assert(protorules);

	if (!opts.optimization) opts.optimization = "-O2"
	if (!opts.ldscripts) opts.ldscripts = []
	if (!opts.libs) opts.libs = []
	if (!opts.defines) opts.defines = []
	if (!opts.includePaths) opts.includePaths = []
	if (!opts.options) opts.options = {}
	if (!opts.options.cxx) opts.options.cxx = []
	if (!opts.options.cc) opts.options.cc = []
	if (!opts.options.ld) opts.options.ld = []

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

CXXModuleCompiler.prototype.__updateModObjects = function(mod) {
	assert(mod);
	var odRules = this.resolveODRule(this.rules, mod.__opts); 

	var sources = mod.getSources();
	var objects = [];

	if (sources.cc) 
		//this.mlib.restorePathArray(sources.cc, mod.moduleDirectory)
		sources.cc.map((file) => {
			objects.push(this.objectUpdate(file, odRules.cc_dep_rule, odRules.cc_rule, mod.getMtime()));
		});

	if (sources.cxx) 
		//this.mlib.restorePathArray(sources.cxx, mod.moduleDirectory)
		sources.cxx.map((file) => {
			objects.push(this.objectUpdate(file, odRules.cxx_dep_rule, odRules.cxx_rule, mod.getMtime()));
		});

	return objects;
}

CXXModuleCompiler.prototype.__assembleObjects = function(mod, objects) {
	var linkRule = this.resolveLinkRule(this.rules, mod.__opts).ld_rule;
	//console.log(mod.__opts.target);

	var target = mod.__opts.target || "target";

	this.mlib.restorePathArray(mod.getOpts().ldscripts, mod.moduleDirectory)

	var executable = this.executableUpdate(objects, target, linkRule, mod.getMtime());
	return executable;
}

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

CXXModuleCompiler.prototype.prepareConstructModuleTree = function(mod, addopts) {
	var __this = this;

	function f(mod, parentopts, addopts) {
		__this.resolveIncludeModules(mod);
	
		//console.log("MODULE", mod.name)
		//console.log("parentopts",parentopts)
		//console.log("modopts",mod.getOpts())
		//console.log("addopts",addopts)
		if (addopts) {
			if (addopts.target) addopts.target = path.resolve(mod.moduleDirectory, addopts.target); 
			__this.mlib.restorePathArray(addopts.includePaths, mod.moduleDirectory);
			__this.mlib.restorePathArray(addopts.ldscripts, mod.moduleDirectory);
		}

		mod.__opts = __this.resolveOptions3(parentopts, mod.getOpts(), addopts);
		//console.log("RESULT", mod.__opts)

		mod.__submods = []
		if (!mod.getModules()) return;

		mod.getModules().forEach((subrec) => {
			var sub = __this.mlib.resolveSubmod(subrec);
			mod.__submods.push(sub);
			f(sub, mod.__opts, subrec.opts);
		}, this);
	}	

	f(mod, this.opts, addopts);
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

CXXModuleCompiler.prototype.prepareModuleOperation = function(mod, addopts) {
	this.prepareConstructModuleTree(mod, addopts);
	var modarray = this.moduleTreeToArray(mod)

	//modarray.forEach((mod) => console.log(mod.__opts));

	this.checkModuleArrayDepends(modarray);
	
	modarray.forEach((mod) => {
		if (this.globalMtime > mod.getMtime()) mod.setMtime(this.globalMtime);
		this.resolveAddOptions(mod.__opts, this.globalOptions);
	},this);

	return modarray;
}

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
 			else throw "STRANGE"
		}
		else if (typeof(a[key]) === "object") {
			if (b[key] === undefined) {} 
			else if (typeof(b[key]) === "object") {
				res[key] = this.mergeObject(a[key], b[key]);
			}
 			else throw "STRANGE"	
		}
		else res[key] = b[key];
	}

	return res;
}

CXXModuleCompiler.prototype.resolveIncludeModules = function(mod) {
	//console.log("resolveIncludeModules")
	var incmodsrec = mod.mod.includeModules;
	if (incmodsrec === undefined) return;

	//console.log("resolveIncludeModules", mod.mod)
	var incmods = [];

	incmodsrec.forEach((inc) => {
		incmods.push(this.mlib.getRealModule(inc.name, inc.impl));
	},this);

	incmods.forEach((inc) => {
		//console.log("resolveIncludeModulesINC", inc.mod)
		this.resolveIncludeModules(inc);
		mod.mod = this.mergeObject(mod.mod, inc.mod);
		if (mod.getMtime() < inc.getMtime()) mod.setMtime(inc.getMtime());
		//console.log("resolveIncludeModulesAFTERINC", mod.mod)
	},this);	

	mod.mod.includeModules = undefined;
}

CXXModuleCompiler.prototype.assembleModule = function(name, addopts) {
	var mod = this.mlib.getModule(name);	
	
//	console.log(mod.mod);

	var modarray = this.prepareModuleOperation(mod, addopts);
	//modarray.forEach((mod) => {console.log(mod.mod);});

	var objects = [];
	modarray.forEach((mod) => {
		objects = objects.concat(this.__updateModObjects(mod));
	});
	
	if (objects !== [])
	
	//console.log(mod.mod);
	//console.log(mod.__opts);
	var ret = this.__assembleObjects(mod, objects);

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