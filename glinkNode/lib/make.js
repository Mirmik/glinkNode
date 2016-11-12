path = require("path")
ruleops = require("./ruleops.js")
assert = require('assert')
mpath = {}
compile = {}

mpath.objects_from_sources = function (sources, bdir) {
	objects = []
	var file = ""
	for (var i = 0; i < sources.length; ++i) {
		file = sources[i].replace(/\.[^.]+$/, ".o")
		console.log (file)
		file = path.resolve(bdir, file)
		objects.push(file)
	}
	return objects
}

objects_from_sources = function(objects, sources, rules, rulesmap, variables, worker) {
	tasklist = []
	assert(objects.length == sources.length)
	var str = ""
	for (var i = 0; i < objects.length; i++) {
		//worker(tasklist)	
	}
}

exports.path = mpath
//exports.compile = compile
exports.objects_from_sources = objects_from_sources