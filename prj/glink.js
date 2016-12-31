console.log(text.green("GLINK script start"))

var files = script.findInTree("src", /.*.gjs/, /.*HIDE.*/);
script.evalFile(files, this);

compiler = new CXXModuleCompiler({
	buildutils : {
		CXX : "g++",
		CC : "gcc",
		AR : "ar",
		LD : "ld",
		OBJDUMP : "objdump",
	},

	opts : {
		optimization : "-O2",

		standart : {
			cxx : "-std=c++11",
			cc : "-std=c11",
		},
	
		defines : [],
		includePaths : ["include"],
		libs : [],
		//options : ["-fdata-sections", "-ffunction-sections", "-Wl,--gc-sections"],
		//ld_options : ["-fdata-sections", "-ffunction-sections", "-Wl,--gc-sections"],
	},

	builddir : "./build",
})
compiler.debugInfo = false;

if (ARGV[0] != undefined) {
	switch (ARGV[0]) {
		case "clean": compiler.cleanBuildDirectory();
	} 

	process.exit(0);
}

Module("main", {
	sources : {
		cxx : ["main.cpp"],
		cc : [],
	},

	opts : {
		includePaths : ["include3"],
		target : "genos",
	},

	modules : [
		{name : "test", opts : {includePaths : ["helpinclude"]}},
		{name : "diag", impl : "stub"},
	],

	includeModules : [
		{name : "genos_libc"},
		{name : "ARCHDEP/stm32f407"},
	],
})

//console.log(compiler.getModuleLibrary().getModule("main").mod);

compiler.updateBuildDirectory();
rets = compiler.assembleModule("main", {
	optimization : "-O3",
	includePaths : ["include2"],
});

if (rets === false) console.log(text.yellow("Nothing to do"))

//globalModuleLibrary().printInfoRegExp(/^s.*/)
//globalModuleLibrary().printModule("main")

//console.log(rets)
console.log(text.green("Script is done"))