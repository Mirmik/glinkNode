var __block = function(str) {
	return "\x1b" + str + "\x1b" + "[0m"  
}

var red = function(str) {
	return __block("[31;1m" + str)
}

var green = function(str) {
	return __block("[32;1m" + str)
}

var yellow = function(str) {
	return __block("[33;1m" + str)
}

exports.red = red
exports.green = green
exports.yellow = yellow

/*
function colorizing.block(str)
	return  string.char(27) .. str ..  string.char(27) .. "[0m"
end

function colorizing.red(str)
	return colorizing.block("[31;1m" .. str)
end

function colorizing.green(str)
	return colorizing.block("[32;1m" .. str)
end

function colorizing.yellow(str)
	return colorizing.block("[33;1m" .. str)
end
*/