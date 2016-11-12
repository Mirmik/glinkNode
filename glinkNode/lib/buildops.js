var path = require("path")

var buildPath = function (str, ext, bdir) {
	var b = new Buffer(str)
	return path.resolve(bdir, b.toString('base64') 
		+ path.basename(str, path.extname(str)) + ext)
}

exports.buildPath = buildPath