console.log(text.green("GLINK script start"))

variables = {
	CXX : "g++",
	CC : "gcc",
	AR : "ar",
	LD : "ld",
	CXXFLAGS : "",
	CCFLAGS : "",

	optimization : "-O3",
	defines : [],
	includePaths : ["-Iinc"],
	libs : ""
}

//rules = ruleops.substitute(rules, options)

//cxx_rule = ruleops.substitute(rules.cxx, variables)
//cxx_dep_rule = ruleops.substitute(rules.cxx_dep, variables)
//cc_rule = ruleops.substitute(rules.cc, variables)
//ld_rule = ruleops.substitute(rules.ld, variables)

//console.log(build.buildPath("main.cpp", ".o", "build"))
//console.log(build.buildPath("dasdmain.cpp", ".o", "build"))

module ({
	name : "main",
	sources : ["main.cpp"],
	submodules : {},
	localVariables : {
		includePaths : "locinc",
		defines : "DEP=222"
	},
	preroutine : (context) => {
		//context.variables.includePaths
	}
})

module ({
	name : "lib",
	sources : ["mmm.cpp"],
})

//modmake.printModuleList()
//modmake.printModule(":lib")
//modmake.printPackList()

glink.evalFile("./lalala.js")
glink.evalScriptsInTree("./src", /\.gjs$/, /HIDE/)

context = modmake.cxxCompilerContext(variables)
context.setBuildDirectory("build")

context.make(":main")

console.log(text.green("Script is done"))