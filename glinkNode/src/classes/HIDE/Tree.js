TreeNode = require("./TreeNode.js")

function Tree(separator) {
	this.separator = separator
	this.root = new TreeNode
}

Tree.prototype.get_array = function(arr) {
	var cur = this.root
	for (var i = 0; i < arr.length; i++) {
		cur = cur.getChild([arr[i]]);
		if (cur == undefined) return undefined;
	}
	return cur.getData()
};

Tree.prototype.get = function(path) {
	return this.get_array(path.split(this.separator))
};

Tree.prototype.add_array = function(arr, data) {
	var cur = this.root
	var next
	for (var i = 0; i < arr.length; i++) {
		next = cur.getChild([arr[i]]);
		if (next == undefined) {
			next = new TreeNode(arr[i])
			cur.addChild(next);
			console.log(arr[i]);		
		}
		cur = next;
	}
	cur.setData(data);
};

Tree.prototype.add = function(path, data) {
	this.add_array(path.split(this.separator), data)
};

Tree.prototype.getRoot = function() {
	return this.root
}

Tree.prototype.print = function() {
	console.log(this.root)
}

module.exports = Tree