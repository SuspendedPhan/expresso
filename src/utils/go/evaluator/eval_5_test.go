// File: eval_5_test.go

package evaluator_test

import "strings"

var expectedObjectInstanceResults = []string{
	// Planet Velocities
	// strings.Join([]string{
	// 	"object|earth: 1 / component|planet > property|planet-velocity = 1",
	// 	"object|earth: 2 / component|planet > property|planet-velocity = 2",
	// 	"object|earth: 3 / component|planet > property|planet-velocity = 3",
	// 	"object|earth: 4 / component|planet > property|planet-velocity = 4",
	// }, "\n"),

	// Circle Radii for Earth Component Planet
	strings.Join([]string{
		"object|earth: 1 / component|planet / object|circle: 1 > property|circle-radius = 2",
		"object|earth: 1 / component|planet / object|circle: 2 > property|circle-radius = 3",
		"object|earth: 1 / component|planet / object|circle: 3 > property|circle-radius = 4",
		"object|earth: 1 / component|planet / object|circle: 4 > property|circle-radius = 5",
		"object|earth: 1 / component|planet / object|circle: 5 > property|circle-radius = 6",
	}, "\n"),

	// Circle Radii for Earth Component Planet Level 2
	strings.Join([]string{
		"object|earth: 2 / component|planet / object|circle: 1 > property|circle-radius = 3",
		"object|earth: 2 / component|planet / object|circle: 2 > property|circle-radius = 4",
		"object|earth: 2 / component|planet / object|circle: 3 > property|circle-radius = 5",
		"object|earth: 2 / component|planet / object|circle: 4 > property|circle-radius = 6",
		"object|earth: 2 / component|planet / object|circle: 5 > property|circle-radius = 7",
	}, "\n"),

	// Circle Radii for Earth Component Planet Level 3
	strings.Join([]string{
		"object|earth: 3 / component|planet / object|circle: 1 > property|circle-radius = 4",
		"object|earth: 3 / component|planet / object|circle: 2 > property|circle-radius = 5",
		"object|earth: 3 / component|planet / object|circle: 3 > property|circle-radius = 6",
		"object|earth: 3 / component|planet / object|circle: 4 > property|circle-radius = 7",
		"object|earth: 3 / component|planet / object|circle: 5 > property|circle-radius = 8",
	}, "\n"),

	// Circle Radii for Earth Component Planet Level 4
	strings.Join([]string{
		"object|earth: 4 / component|planet / object|circle: 1 > property|circle-radius = 5",
		"object|earth: 4 / component|planet / object|circle: 2 > property|circle-radius = 6",
		"object|earth: 4 / component|planet / object|circle: 3 > property|circle-radius = 7",
		"object|earth: 4 / component|planet / object|circle: 4 > property|circle-radius = 8",
		"object|earth: 4 / component|planet / object|circle: 5 > property|circle-radius = 9",
	}, "\n"),

	// Moon Properties for Earth Level 1
	strings.Join([]string{
		"object|earth: 1 / object|moon: 1 > property|moon-radius = 2",
		"object|earth: 1 / object|moon: 1 > property|moon-x = 7",
	}, "\n"),
	strings.Join([]string{
		"object|earth: 1 / object|moon: 2 > property|moon-radius = 3",
		"object|earth: 1 / object|moon: 2 > property|moon-x = 7",
	}, "\n"),
	strings.Join([]string{
		"object|earth: 1 / object|moon: 3 > property|moon-radius = 4",
		"object|earth: 1 / object|moon: 3 > property|moon-x = 7",
	}, "\n"),

	// Moon Properties for Earth Level 2
	strings.Join([]string{
		"object|earth: 2 / object|moon: 1 > property|moon-radius = 3",
		"object|earth: 2 / object|moon: 1 > property|moon-x = 7",
	}, "\n"),
	strings.Join([]string{
		"object|earth: 2 / object|moon: 2 > property|moon-radius = 4",
		"object|earth: 2 / object|moon: 2 > property|moon-x = 7",
	}, "\n"),
	strings.Join([]string{
		"object|earth: 2 / object|moon: 3 > property|moon-radius = 5",
		"object|earth: 2 / object|moon: 3 > property|moon-x = 7",
	}, "\n"),

	// Moon Properties for Earth Level 3
	strings.Join([]string{
		"object|earth: 3 / object|moon: 1 > property|moon-radius = 4",
		"object|earth: 3 / object|moon: 1 > property|moon-x = 7",
	}, "\n"),
	strings.Join([]string{
		"object|earth: 3 / object|moon: 2 > property|moon-radius = 5",
		"object|earth: 3 / object|moon: 2 > property|moon-x = 7",
	}, "\n"),
	strings.Join([]string{
		"object|earth: 3 / object|moon: 3 > property|moon-radius = 6",
		"object|earth: 3 / object|moon: 3 > property|moon-x = 7",
	}, "\n"),

	// Moon Properties for Earth Level 4
	strings.Join([]string{
		"object|earth: 4 / object|moon: 1 > property|moon-radius = 5",
		"object|earth: 4 / object|moon: 1 > property|moon-x = 7",
	}, "\n"),
	strings.Join([]string{
		"object|earth: 4 / object|moon: 2 > property|moon-radius = 6",
		"object|earth: 4 / object|moon: 2 > property|moon-x = 7",
	}, "\n"),
	strings.Join([]string{
		"object|earth: 4 / object|moon: 3 > property|moon-radius = 7",
		"object|earth: 4 / object|moon: 3 > property|moon-x = 7",
	}, "\n"),
}
