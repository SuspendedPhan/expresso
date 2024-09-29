// eval1_extract_property_paths_test.go

package evaluator_test

import (
	"testing"

	"expressioni.sta/evaluator"
)

// ---Input---
// - object|earth
//     - component|planet
//         - property|planet-velocity
//             - reference-expr: object|earth > clone-number-target
//         - object|circle
//             - property|radius
//                 - call-expr
//                     - reference-expr: object|earth > component|planet > property|planet-velocity
//                     - reference-expr: object|earth > object|circle > clone-number-target
//     - object|moon
//         - property|radius
//             - call-expr
//                 - reference-expr: object|earth > clone-number-target
//                 - reference-expr: object|earth > object|moon > clone-number-target
//
// ---Output---
// CloneCountPropertyPaths:
// - object|earth > clone-count-property
// - object|earth / object|moon > clone-count-property
// - object|earth / component|planet / object|circle > clone-count-property

// NonCloneCountPropertyPaths:
// - object|earth / object|moon > property|radius
// - object|earth / component|planet > property|planet-velocity
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
	e.PropertyCreate("planet-velocity")
	e.PropertyCreate("circle-radius")

	// --- Add properties to objects ---

	e.ExObjectSetCloneCountProperty("earth", "earth-clone-count")
	e.ExObjectSetCloneCountProperty("moon", "moon-clone-count")
	e.ExObjectSetCloneCountProperty("circle", "circle-clone-count")

	e.ExObjectAddBasicProperty("moon", "moon-radius")
	e.ComponentAddBasicProperty("planet", "planet-velocity")
	e.ExObjectAddBasicProperty("circle", "circle-radius")

	// --- Set relationships ---

	e.ExObjectSetComponent("earth", "planet")
	e.ComponentAddRootObject("planet", "circle")
	e.ExObjectAddChild("earth", "moon")

	// --- Add root objects ---
	e.AddRootExObject("earth")

	// --- Add clone count exprs ---
	e.NumberExprCreate("earth-clone-count-expr")
	e.NumberExprCreate("moon-clone-count-expr")
	e.NumberExprCreate("circle-clone-count-expr")

	e.NumberExprSetValue("earth-clone-count-expr", 4)
	e.NumberExprSetValue("moon-clone-count-expr", 3)
	e.NumberExprSetValue("circle-clone-count-expr", 5)

	e.PropertySetExpr("earth-clone-count", "earth-clone-count-expr")
	e.PropertySetExpr("moon-clone-count", "moon-clone-count-expr")
	e.PropertySetExpr("circle-clone-count", "circle-clone-count-expr")

	// --- Add expr for object|earth / component|planet > property|planet-velocity ---

	e.ReferenceExprCreate("planet-velocity-expr")
	e.ReferenceExprSetTargetId("planet-velocity-expr", "earth")
	e.ReferenceExprSetTargetKind("planet-velocity-expr", "Property/CloneCountProperty")

	// --- Add expr for object|earth / component|planet / object|circle > property|radius ---
	e.CallExprCreate("circle-radius-expr")
	e.ReferenceExprCreate("circle-radius-expr-arg-0")
	e.ReferenceExprCreate("circle-radius-expr-arg-1")

	e.CallExprSetArg0("circle-radius-expr", "circle-radius-expr-arg-0")
	e.CallExprSetArg1("circle-radius-expr", "circle-radius-expr-arg-1")
	e.ReferenceExprSetTargetId("circle-radius-expr-arg-0", "planet-velocity")
	e.ReferenceExprSetTargetKind("circle-radius-expr-arg-0", "Property/BasicProperty")
	e.ReferenceExprSetTargetId("circle-radius-expr-arg-1", "circle")
	e.ReferenceExprSetTargetKind("circle-radius-expr-arg-1", "Property/CloneCountProperty")

	// --- Add expr for object|earth / object|moon > property|radius ---

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
		"object|earth / component|planet > property|planet-velocity",
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
	// - object|earth / component|planet > property|planet-velocity
	// - object|earth / component|planet / object|circle > property|radius

	// ---Output---
	// AnnotatedPropertyPaths:
	// - object|earth: (4) / object|moon: (3) > property|moon-radius
	// - object|earth: (4) / component|planet > property|planet-velocity
	// - object|earth: (4) / component|planet / object|circle: (5) > property|circle-radius

	annotatedPropertyPaths := e.AnnotateCloneCounts(cloneCountPropertyPaths, propertyPaths)
	if len(annotatedPropertyPaths) != 3 {
		t.Errorf("Expected 3 annotated property paths, got %d", len(annotatedPropertyPaths))
	}

	expectedAnnotatedPropertyPaths := []string{
		"object|earth: (4) / component|planet > property|planet-velocity",
		"object|earth: (4) / component|planet / object|circle: (5) > property|circle-radius",
		"object|earth: (4) / object|moon: (3) > property|moon-radius",
	}

	for i, path := range annotatedPropertyPaths {
		if path.String() != expectedAnnotatedPropertyPaths[i] {
			t.Errorf("Expected %s, got %s", expectedAnnotatedPropertyPaths[i], path.String())
		}
	}

	// ------ Test3 ExpandInstancePaths ------

	// ---Input---
	// AnnotatedPropertyPaths:
	// - object|earth: (4) / object|moon: (3) > property|moon-radius
	// - object|earth: (4) / component|planet > property|planet-velocity
	// - object|earth: (4) / component|planet / object|circle: (5) > property|circle-radius

	// ---Output---
	// PropertyInstancePath: (object|earth: 1 / component|planet > property|planet-velocity)
	// PropertyInstancePath: (object|earth: 2 / component|planet > property|planet-velocity)
	// PropertyInstancePath: (object|earth: 3 / component|planet > property|planet-velocity)
	// PropertyInstancePath: (object|earth: 4 / component|planet > property|planet-velocity)

	// PropertyInstancePath: (object|earth: 1 / component|planet / object|circle: 1 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 1 / component|planet / object|circle: 2 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 1 / component|planet / object|circle: 3 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 1 / component|planet / object|circle: 4 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 1 / component|planet / object|circle: 5 > property|circle-radius)

	// PropertyInstancePath: (object|earth: 2 / component|planet / object|circle: 1 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 2 / component|planet / object|circle: 2 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 2 / component|planet / object|circle: 3 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 2 / component|planet / object|circle: 4 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 2 / component|planet / object|circle: 5 > property|circle-radius)

	// PropertyInstancePath: (object|earth: 3 / component|planet / object|circle: 1 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 3 / component|planet / object|circle: 2 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 3 / component|planet / object|circle: 3 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 3 / component|planet / object|circle: 4 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 3 / component|planet / object|circle: 5 > property|circle-radius)

	// PropertyInstancePath: (object|earth: 4 / component|planet / object|circle: 1 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 4 / component|planet / object|circle: 2 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 4 / component|planet / object|circle: 3 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 4 / component|planet / object|circle: 4 > property|circle-radius)
	// PropertyInstancePath: (object|earth: 4 / component|planet / object|circle: 5 > property|circle-radius)

	// PropertyInstancePath: (object|earth: 1 / object|moon: 1 > property|moon-radius)
	// PropertyInstancePath: (object|earth: 1 / object|moon: 2 > property|moon-radius)
	// PropertyInstancePath: (object|earth: 1 / object|moon: 3 > property|moon-radius)

	// PropertyInstancePath: (object|earth: 2 / object|moon: 1 > property|moon-radius)
	// PropertyInstancePath: (object|earth: 2 / object|moon: 2 > property|moon-radius)
	// PropertyInstancePath: (object|earth: 2 / object|moon: 3 > property|moon-radius)

	// PropertyInstancePath: (object|earth: 3 / object|moon: 1 > property|moon-radius)
	// PropertyInstancePath: (object|earth: 3 / object|moon: 2 > property|moon-radius)
	// PropertyInstancePath: (object|earth: 3 / object|moon: 3 > property|moon-radius)

	// PropertyInstancePath: (object|earth: 4 / object|moon: 1 > property|moon-radius)
	// PropertyInstancePath: (object|earth: 4 / object|moon: 2 > property|moon-radius)
	// PropertyInstancePath: (object|earth: 4 / object|moon: 3 > property|moon-radius)

	propertyInstancePaths := e.ExpandInstancePaths(annotatedPropertyPaths)

	if len(propertyInstancePaths) != 36 {
		t.Errorf("Expected 36 property instance paths, got %d", len(propertyInstancePaths))
	}

	expectedPropertyInstancePaths_ := expectedPropertyInstancePaths

	for i, path := range propertyInstancePaths {
		if path.String() != expectedPropertyInstancePaths_[i] {
			t.Errorf("Expected %s, got %s", expectedPropertyInstancePaths_[i], path.String())
		}
	}

	// ------ Test4 EvaluatePropertyInstances ------

	// ---Output---

}
