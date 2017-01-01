function argumentParser_evalopt(context, rec){
	if (rec.type == "Boolean") {
		context.ret[rec.name] = true;
		context.count++;
		return;
	} else {
		
		return;
	}
	throw "AllBad";
}

function argumentParser_alias(context, arg) {
	for (var i = 0; i < context.table.length; i++) {
		if (arg[1] == context.table[i].alias) {
			argumentParser_evalopt(context, context.table[i]);
			return;
		}
	} 
	console.log(`unresolved alias -${arg[1]}`)
	process.exit(1)
}

function argumentParser_parametr(context, arg) {
	for (var i = 0; i < context.table.length; i++) {
		if (arg.slice(2) == context.table[i].name) {
			context.count++;
			argumentParser_evalopt(context, context.table[i]);
			return;
		}	
	} 
	console.log(`unresolved parametr --${arg.slice(1)}`)
	process.exit(1)
}

function argumentParser(args, table) {
	var context = {count : 0, args : args, table : table, ret : {}};
	
	while (context.count < context.args.length) {
		var arg = context.args[context.count];

		console.log(arg);

		if (arg[0] == '-' && arg[1] != '-') {
			argumentParser_alias(context, arg);
			continue;
		} else if (arg[0] == '-' && arg[1] == '-') {
			argumentParser_parametr(context, arg);
			continue;
		} 
	}

	return context.ret
}

module.exports.argumentParser = argumentParser