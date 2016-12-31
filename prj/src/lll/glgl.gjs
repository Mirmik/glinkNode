Module("test", {
	sources : 
	{
		cc : ["test.c"]
	},

	opts : 
	{
		includePaths : ["includeHelper"],
	},

	depends : ["diag"],

	modules : [
		{name : "base"},
	] 
});

Module ("base", {
	
})

Implementation("diag", "stub", {
	sources : {
		cc : ["diag_stub.c"],
	},
});

Implementation("diag", "impl", {
	sources : {
		cc : ["diag_stub.c"],
	},
});
