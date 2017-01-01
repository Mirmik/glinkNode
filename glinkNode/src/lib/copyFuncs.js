var copyFuncs = {}

copyFuncs.copyObject = function(obj) {
	var copy = {};
	for (var key in obj) {
		copy[key] = obj[key];
	}
	return copy;
}

/*copyFuncs.deepCopy = function(obj) {
	var clone = Object.create(Object.getPrototypeOf(obj));

	var i, keys = Object.getOwnPropertyNames(obj);

	for (i = 0; i < keys.length; i++) {
		Object.defineProperty(clone, keys[i], 
			Object.getOwnPropertyDescriptor(obj, keys[i]));
	}

	console.log("OBJE:",obj);
	console.log("COPY:", clone);

	return clone;
}*/

module.exports = copyFuncs;