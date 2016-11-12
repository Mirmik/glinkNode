ruleops = require("./ruleops.js")

var execTask = function(task, executor) {
	comstr = ruleops.substitute(task.rule, {
		src : task.sources,
		tgt : task.target
	})
	return executor(comstr)
}

exports.execTask = execTask