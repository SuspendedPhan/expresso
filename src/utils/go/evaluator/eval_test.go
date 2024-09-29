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

func TestEval(t *testing.T) {
	// ------ Test1 ExtractPropertyPaths ------

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
		"object|earth / component|planet / object|circle > clone-count-property",
		"object|earth / object|moon > clone-count-property",
	}

	for i, path := range cloneCountPropertyPaths {
		if path.String() != expectedCloneCountPropertyPaths[i] {
			t.Errorf("Expected %s, got %s", expectedCloneCountPropertyPaths[i], path.String())
		}
	}

	// Verify the property paths
	expectedPropertyPaths := []string{
		"object|earth / component|planet > property|velocity",
		"object|earth / component|planet / object|circle > property|circle-radius",
		"object|earth / object|moon > property|moon-radius",
	}

	for i, path := range propertyPaths {
		if path.String() != expectedPropertyPaths[i] {
			t.Errorf("Expected %s, got %s", expectedPropertyPaths[i], path.String())
		}
	}

	// ------ Test2 AnnotateCloneCounts ------

	// ---Input---
	// CloneCountPropertyPaths:
	// - object|earth > clone-count-property
	// - object|earth / object|moon > clone-count-property
	// - object|earth / component|planet / object|circle > clone-count-property

	// NonCloneCountPropertyPaths:
	// - object|earth / object|moon > property|radius
	// - object|earth / component|planet > property|velocity
	// - object|earth / component|planet / object|circle > property|radius

	// ---Output---
	// AnnotatedPropertyPaths:
	// - object|earth: (10) / object|moon: (5) > property|radius
	// - object|earth: (10) / component|planet > property|velocity
	// - object|earth: (10) / component|planet / object|circle: (15) > property|radius

	annotatedPropertyPaths := e.AnnotateCloneCounts(cloneCountPropertyPaths, propertyPaths)
	if len(annotatedPropertyPaths) != 3 {
		t.Errorf("Expected 3 annotated property paths, got %d", len(annotatedPropertyPaths))
	}

	expectedAnnotatedPropertyPaths := []string{
		"object|earth: (10) / object|moon: (5) > property|moon-radius",
		"object|earth: (10) / component|planet > property|velocity",
		"object|earth: (10) / component|planet / object|circle: (15) > property|circle-radius",
	}

	for i, path := range annotatedPropertyPaths {
		if path.String() != expectedAnnotatedPropertyPaths[i] {
			t.Errorf("Expected %s, got %s", expectedAnnotatedPropertyPaths[i], path.String())
		}
	}
}
