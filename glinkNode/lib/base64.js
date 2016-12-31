var base64 = {}

base64.base64 = function(str) {
	return new Buffer(str).toString('base64');
}

module.exports = base64;