var fs = require('fs')
var path = require('path')

cxxContextRules = {
	cxx : "%CXX -c %src -o %tgt %options",
	cc : "%CC -c %src -o %tgt %options",
	ld : "%CXX %src -o %tgt %options",
	cxx_dep : "%CXX %src -MM %options > %tgt"
}

exports.hello = function() {
	console.log("hello " + this.name)
}

exports.constructor = function(vars) {
	this.rules = cxxContextRules
	this.variables = vars
}

exports.createBuildDir = function() {
	try {
		fs.existsSync(this.buildDir)
	}
	catch (err) {
		fs.mkdir(this.buildDir)
	}
}

exports.make = function(name) {
	this.createBuildDir()
	module = this.moduleList[name]
	if (module == undefined) throw Error("undefined module")
}

exports.setBuildDirectory = function(bdir) {
	this.buildDir = bdir 
}