function ModuleClass(name, mod) {
	if (!this instanceof ModuleClass) {
		return new ModuleClass();
	}

	this.mod = mod;
	this.name = name;
}

ModuleClass.prototype.getOpts = function() {
	return this.mod.opts;
} 

ModuleClass.prototype.getSources = function() {
	return this.mod.sources;
} 

ModuleClass.prototype.getMtime = function() {
	return this.mtime;
} 

ModuleClass.prototype.setMtime = function(time) {
	this.mtime = time;
} 

ModuleClass.prototype.getModules = function() {
	return this.mod.modules;
} 

module.exports = ModuleClass;
