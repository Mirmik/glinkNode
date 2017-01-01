function VariantModuleClass(name) {
	this.implementations = {}
	this.name = name
}

VariantModuleClass.prototype.addImplementation = function(mod) {
	this.implementations[mod.impl] = mod.module;
}

VariantModuleClass.prototype.getImplementation = function(name) {
	return this.implementations[name];
}

VariantModuleClass.prototype.print = function() {
	console.log(this.implementations);
}

module.exports = VariantModuleClass