var execSync = require('child_process').execSync;
var text = require('./text.js')

execute = function(str) {
	try{
		console.log(str)
		execSync(str, (error,stdout,stderr) => {})
	}
	catch (err) {
		console.log(text.red("Subroutine Error"))
		process.exit()		
	}
}

exports.execute = execute