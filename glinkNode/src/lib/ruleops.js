function __substitute(rule,list) {
	var rulelist = rule.split(" ")
	var newrulelist = [];
	var newruleidx = 0;

	for (var i = 0; i < rulelist.length; i++) {
		newvar = rulelist[i]
		for (var key in list) {
			if (rulelist[i] == "%" + key) {
				newvar = list[key]
				if (Array.isArray(newvar)) newvar = newvar.join(" ")
			}
		}
		if (newvar != "") {
			newrulelist[newruleidx] = newvar
			newruleidx++
		}
	}
	return newrulelist.join(" ")
}

function __substitute_list(rules,list) { 
	var newrules = {}
	for (var key in rules) {
		var value = rules[key]
		newrules[key] = __substitute(value, list)
	}
	return newrules
}

substitute = function(rules, list) {
	if (typeof(rules) == "object") {
		//console.log("Object")
		return __substitute_list(rules, list)
	}
	else {
		//console.log("NoObject")
		return __substitute(rules, list)
	}
}

exports.substitute = substitute