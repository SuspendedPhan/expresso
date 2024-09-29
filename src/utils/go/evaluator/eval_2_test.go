// File: eval_2_test.go

package evaluator_test

var expectedPropertyInstancePaths = []string{
	// Velocity Property Paths
	"object|earth: 1 / component|planet > property|velocity",
	"object|earth: 2 / component|planet > property|velocity",
	"object|earth: 3 / component|planet > property|velocity",
	"object|earth: 4 / component|planet > property|velocity",

	// Circle Radius Property Paths
	"object|earth: 1 / component|planet / object|circle: 1 > property|circle-radius",
	"object|earth: 1 / component|planet / object|circle: 2 > property|circle-radius",
	"object|earth: 1 / component|planet / object|circle: 3 > property|circle-radius",
	"object|earth: 1 / component|planet / object|circle: 4 > property|circle-radius",
	"object|earth: 1 / component|planet / object|circle: 5 > property|circle-radius",

	"object|earth: 2 / component|planet / object|circle: 1 > property|circle-radius",
	"object|earth: 2 / component|planet / object|circle: 2 > property|circle-radius",
	"object|earth: 2 / component|planet / object|circle: 3 > property|circle-radius",
	"object|earth: 2 / component|planet / object|circle: 4 > property|circle-radius",
	"object|earth: 2 / component|planet / object|circle: 5 > property|circle-radius",

	"object|earth: 3 / component|planet / object|circle: 1 > property|circle-radius",
	"object|earth: 3 / component|planet / object|circle: 2 > property|circle-radius",
	"object|earth: 3 / component|planet / object|circle: 3 > property|circle-radius",
	"object|earth: 3 / component|planet / object|circle: 4 > property|circle-radius",
	"object|earth: 3 / component|planet / object|circle: 5 > property|circle-radius",

	"object|earth: 4 / component|planet / object|circle: 1 > property|circle-radius",
	"object|earth: 4 / component|planet / object|circle: 2 > property|circle-radius",
	"object|earth: 4 / component|planet / object|circle: 3 > property|circle-radius",
	"object|earth: 4 / component|planet / object|circle: 4 > property|circle-radius",
	"object|earth: 4 / component|planet / object|circle: 5 > property|circle-radius",

	// Moon Radius Property Paths
	"object|earth: 1 / object|moon: 1 > property|moon-radius",
	"object|earth: 1 / object|moon: 2 > property|moon-radius",
	"object|earth: 1 / object|moon: 3 > property|moon-radius",

	"object|earth: 2 / object|moon: 1 > property|moon-radius",
	"object|earth: 2 / object|moon: 2 > property|moon-radius",
	"object|earth: 2 / object|moon: 3 > property|moon-radius",

	"object|earth: 3 / object|moon: 1 > property|moon-radius",
	"object|earth: 3 / object|moon: 2 > property|moon-radius",
	"object|earth: 3 / object|moon: 3 > property|moon-radius",

	"object|earth: 4 / object|moon: 1 > property|moon-radius",
	"object|earth: 4 / object|moon: 2 > property|moon-radius",
	"object|earth: 4 / object|moon: 3 > property|moon-radius",
}
