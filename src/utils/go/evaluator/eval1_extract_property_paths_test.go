// eval1_extract_property_paths_test.go

package evaluator_test

import (
	"testing"

	"expressioni.sta/evaluator"
)

// ---Input---
// - object|earth
//     - component|planet
//         - property|velocity
//         - object|circle
//             - property|radius
//     - object|moon
//         - property|radius
//
// ---Output---
// CloneCountPropertyPaths:
// - object|earth > clone-count-property
// - object|earth / object|moon > clone-count-property
// - object|earth / component|planet / object|circle > clone-count-property

// NonCloneCountPropertyPaths:
// - object|earth / object|moon > property|radius
// - object|earth / component|planet > property|velocity
// - object|earth / component|planet / object|circle > property|radius

func TestExtractPropertyPaths(t *testing.T) {
	// Create the evaluator
	e := evaluator.NewEvaluator(&evaluator.NoopLogger{})

	// --- Create the object hierarchy ---

	e.ExObjectCreate("earth")
	e.ExObjectCreate("moon")
	e.ExObjectCreate("circle")

	e.ComponentCreate("planet")

	e.PropertyCreate("earth-clone-count")
	e.PropertyCreate("moon-clone-count")
	e.PropertyCreate("circle-clone-count")

	e.PropertyCreate("moon-radius")
	e.PropertyCreate("velocity")
	e.PropertyCreate("circle-radius")

	// --- Add properties to objects ---

	e.ExObjectSetCloneCountProperty("earth", "earth-clone-count")
	e.ExObjectSetCloneCountProperty("moon", "moon-clone-count")
	e.ExObjectSetCloneCountProperty("circle", "circle-clone-count")

	e.ExObjectAddBasicProperty("moon", "moon-radius")
	e.ComponentAddBasicProperty("planet", "velocity")
	e.ExObjectAddBasicProperty("circle", "circle-radius")

	// --- Set relationships ---

	e.ExObjectSetComponent("earth", "planet")
	e.ComponentAddRootObject("planet", "circle")
	e.ExObjectAddChild("earth", "moon")

	// --- Add root objects ---
	e.AddRootExObject("earth")

	// --- Begin test ---

	cloneCountPropertyPaths, propertyPaths := e.ExtractPropertyPaths(e.RootExObjects())

	// Verify the results
	if len(cloneCountPropertyPaths) != 3 {
		t.Errorf("Expected 3 clone count property paths, got %d", len(cloneCountPropertyPaths))
	}

	if len(propertyPaths) != 3 {
		t.Errorf("Expected 3 property paths, got %d", len(propertyPaths))
	}

	// Verify the clone count property paths
	expectedCloneCountPropertyPaths := []string{
		"object|earth > clone-count-property",
		"object|earth / object|moon > clone-count-property",
		"object|earth / component|planet / object|circle > clone-count-property",
	}

	for i, path := range cloneCountPropertyPaths {
		if path.ToString() != expectedCloneCountPropertyPaths[i] {
			t.Errorf("Expected %s, got %s", expectedCloneCountPropertyPaths[i], path.ToString())
		}
	}

	// Verify the property paths
	expectedPropertyPaths := []string{
		"object|earth / object|moon > property|radius",
		"object|earth / component|planet > property|velocity",
		"object|earth / component|planet / object|circle > property|radius",
	}

	for i, path := range propertyPaths {
		if path.ToString() != expectedPropertyPaths[i] {
			t.Errorf("Expected %s, got %s", expectedPropertyPaths[i], path.ToString())
		}
	}
}
