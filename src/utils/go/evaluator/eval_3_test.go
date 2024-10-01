// File: eval_3_test.go

package evaluator_test

var expectedPropertyInstanceResults = []string{
	// Planet Velocities
	"object|earth: 1 / component|planet > property|planet-velocity = 1",
	"object|earth: 2 / component|planet > property|planet-velocity = 2",
	"object|earth: 3 / component|planet > property|planet-velocity = 3",
	"object|earth: 4 / component|planet > property|planet-velocity = 4",

	// Circle Radii for Earth Component Planet
	"object|earth: 1 / component|planet / object|circle: 1 > property|circle-radius = 2",
	"object|earth: 1 / component|planet / object|circle: 2 > property|circle-radius = 3",
	"object|earth: 1 / component|planet / object|circle: 3 > property|circle-radius = 4",
	"object|earth: 1 / component|planet / object|circle: 4 > property|circle-radius = 5",
	"object|earth: 1 / component|planet / object|circle: 5 > property|circle-radius = 6",

	// Circle Radii for Earth Component Planet Level 2
	"object|earth: 2 / component|planet / object|circle: 1 > property|circle-radius = 3",
	"object|earth: 2 / component|planet / object|circle: 2 > property|circle-radius = 4",
	"object|earth: 2 / component|planet / object|circle: 3 > property|circle-radius = 5",
	"object|earth: 2 / component|planet / object|circle: 4 > property|circle-radius = 6",
	"object|earth: 2 / component|planet / object|circle: 5 > property|circle-radius = 7",

	// Circle Radii for Earth Component Planet Level 3
	"object|earth: 3 / component|planet / object|circle: 1 > property|circle-radius = 4",
	"object|earth: 3 / component|planet / object|circle: 2 > property|circle-radius = 5",
	"object|earth: 3 / component|planet / object|circle: 3 > property|circle-radius = 6",
	"object|earth: 3 / component|planet / object|circle: 4 > property|circle-radius = 7",
	"object|earth: 3 / component|planet / object|circle: 5 > property|circle-radius = 8",

	// Circle Radii for Earth Component Planet Level 4
	"object|earth: 4 / component|planet / object|circle: 1 > property|circle-radius = 5",
	"object|earth: 4 / component|planet / object|circle: 2 > property|circle-radius = 6",
	"object|earth: 4 / component|planet / object|circle: 3 > property|circle-radius = 7",
	"object|earth: 4 / component|planet / object|circle: 4 > property|circle-radius = 8",
	"object|earth: 4 / component|planet / object|circle: 5 > property|circle-radius = 9",

	// Moon Radii for Earth Level 1
	"object|earth: 1 / object|moon: 1 > property|moon-radius = 2",
	"object|earth: 1 / object|moon: 2 > property|moon-radius = 3",
	"object|earth: 1 / object|moon: 3 > property|moon-radius = 4",

	// Moon Radii for Earth Level 2
	"object|earth: 2 / object|moon: 1 > property|moon-radius = 3",
	"object|earth: 2 / object|moon: 2 > property|moon-radius = 4",
	"object|earth: 2 / object|moon: 3 > property|moon-radius = 5",

	// Moon Radii for Earth Level 3
	"object|earth: 3 / object|moon: 1 > property|moon-radius = 4",
	"object|earth: 3 / object|moon: 2 > property|moon-radius = 5",
	"object|earth: 3 / object|moon: 3 > property|moon-radius = 6",

	// Moon Radii for Earth Level 4
	"object|earth: 4 / object|moon: 1 > property|moon-radius = 5",
	"object|earth: 4 / object|moon: 2 > property|moon-radius = 6",
	"object|earth: 4 / object|moon: 3 > property|moon-radius = 7",

	// Moon-x Property Results
	"object|earth: 1 / object|moon: 1 > property|moon-x = 7",
	"object|earth: 1 / object|moon: 2 > property|moon-x = 7",
	"object|earth: 1 / object|moon: 3 > property|moon-x = 7",

	"object|earth: 2 / object|moon: 1 > property|moon-x = 7",
	"object|earth: 2 / object|moon: 2 > property|moon-x = 7",
	"object|earth: 2 / object|moon: 3 > property|moon-x = 7",

	"object|earth: 3 / object|moon: 1 > property|moon-x = 7",
	"object|earth: 3 / object|moon: 2 > property|moon-x = 7",
	"object|earth: 3 / object|moon: 3 > property|moon-x = 7",

	"object|earth: 4 / object|moon: 1 > property|moon-x = 7",
	"object|earth: 4 / object|moon: 2 > property|moon-x = 7",
	"object|earth: 4 / object|moon: 3 > property|moon-x = 7",
}
