var CXXModuleCompiler = {}

CXXModuleCompiler.printModuleList = function() {
	console.log(this.mlib.moduleList)
	return this
}

CXXModuleCompiler.printPackList = function() {
	console.log(this.mlib.packList)
	return this
}

CXXModuleCompiler.construct = function() {
	var object = {}
	//object.mlib = mlib
	object.__proto__ = CXXModuleCompiler 
	return object
}

CXXModuleCompiler.setModuleLibrary = function(mlib) {
	this.mlib = mlib
	return this
}

exports.construct = CXXModuleCompiler.construct