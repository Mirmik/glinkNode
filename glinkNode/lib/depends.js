var fs = require("fs")

var depends = {}

depends.needToRecompile = function(depfile, modmtime, fileCache) {
	if (depfile.exists == false) return true; 
	
	var text = fs.readFileSync(depfile.path).toString();
	
	//console.log(text)
	if (text.length < 2) return true;

	var arr = text.match(/[^ \n\\]+/g);
	arr = arr.splice(1, arr.length - 1);

	var maxtime = modmtime;
	
	arr.forEach(function(filepath){
		file = fileCache.getFile(filepath);
		if (file.mtime > maxtime) maxtime = file.mtime;
	})

	return maxtime > depfile.mtime;
};

module.exports = depends