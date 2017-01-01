function TreeNode(id) {
	this.id = id
	this.data = null
	this.children = {}
}

TreeNode.prototype.addChild = function(node) {
	this.children[node.id] = node
}

TreeNode.prototype.getChild = function(id) {
	return this.children[id]
}

TreeNode.prototype.getData = function() {
	return this.data
}

TreeNode.prototype.setData = function(newdata) {
	this.data = newdata
}

/*TreeNode.prototype.assignNode_array = function(arr,val) {
	var cur = this.obj
	var size = arr.length
	var r = arr.forEach((ref, index)=>{

		if (index === size - 1) {
			cur[ref] = val
			return
		}

		if (cur[ref] == undefined) cur[ref] = {}
		cur = cur[ref] 
	})
}*/

TreeNode.prototype.print = function() {
	console.log(this)
}

module.exports = TreeNode