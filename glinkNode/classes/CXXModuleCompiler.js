var CXXModuleCompiler = {}

CXXModuleCompiler.printModuleList = function() {
	console.log(this.mlib.moduleList)
}

CXXModuleCompiler.printPackList = function() {
	console.log(this.mlib.packList)
}

CXXModuleCompiler.construct = function(mlib) {
	var object = {}
	object.mlib = mlib
	object.__proto__ = CXXModuleCompiler 
	return object
}

exports.construct = CXXModuleCompiler.construct