Module ("genos_libc", {
	source : {
		cc : ["mmm.c"],
	},

	opts : {
		includePaths : ["includeLIBC"],
	},

	modules : [
		{name : "stdio"},
		{name : "stdlib"},
	],

	includeModules : [
		{name : "__unistd"}
	]
})

Module("__unistd", {
	modules : [
		{name : "unistd"}
	]
})

Module("ARCHDEP/stm32f407", {
	modules : [
		//{name : "stm32f4xx.arch"} 
	],

	opts : {
		//ldscripts : ["ldscript/ldscript.ld"]
	} 
})

Module ('stdio',{})
Module ('stdlib',{})
Module ('unistd',{})