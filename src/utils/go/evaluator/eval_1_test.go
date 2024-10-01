// eval1_extract_property_paths_test.go

package evaluator_test

import (
	"reflect"
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
//         - property|moon-x
//             - number-expr: 7
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
// - object|earth / object|moon > property|moon-x

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
	e.PropertyCreate("moon-x")

	// --- Add properties to objects ---

	e.ExObjectSetCloneCountProperty("earth", "earth-clone-count")
	e.ExObjectSetCloneCountProperty("moon", "moon-clone-count")
	e.ExObjectSetCloneCountProperty("circle", "circle-clone-count")

	e.ExObjectAddBasicProperty("moon", "moon-radius")
	e.ExObjectAddBasicProperty("moon", "moon-x")
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

	e.PropertySetExpr("planet-velocity", "planet-velocity-expr")

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

	e.PropertySetExpr("circle-radius", "circle-radius-expr")

	// --- Add expr for object|earth / object|moon > property|radius ---

	e.CallExprCreate("moon-radius-expr")
	e.ReferenceExprCreate("moon-radius-expr-arg-0")
	e.ReferenceExprCreate("moon-radius-expr-arg-1")

	e.CallExprSetArg0("moon-radius-expr", "moon-radius-expr-arg-0")
	e.CallExprSetArg1("moon-radius-expr", "moon-radius-expr-arg-1")
	e.ReferenceExprSetTargetId("moon-radius-expr-arg-0", "earth")
	e.ReferenceExprSetTargetKind("moon-radius-expr-arg-0", "Property/CloneCountProperty")
	e.ReferenceExprSetTargetId("moon-radius-expr-arg-1", "moon")
	e.ReferenceExprSetTargetKind("moon-radius-expr-arg-1", "Property/CloneCountProperty")

	e.PropertySetExpr("moon-radius", "moon-radius-expr")

	// --- Add expr for object|earth / object|moon > property|moon-x ---

	e.NumberExprCreate("moon-x-expr")
	e.NumberExprSetValue("moon-x-expr", 7)
	e.PropertySetExpr("moon-x", "moon-x-expr")

	// --- Begin test ---

	cloneCountPropertyPaths, propertyPaths := e.ExtractPropertyPaths(e.RootExObjects())

	// Verify the results
	if len(cloneCountPropertyPaths) != 3 {
		t.Errorf("Expected 3 clone count property paths, got %d", len(cloneCountPropertyPaths))
	}

	if len(propertyPaths) != 4 {
		t.Errorf("Expected 4 property paths, got %d", len(propertyPaths))
	}

	// Verify the clone count property paths
	expectedCloneCountPropertyPaths := []string{
		"object|earth > property|earth-clone-count",
		"object|earth / component|planet / object|circle > property|circle-clone-count",
		"object|earth / object|moon > property|moon-clone-count",
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
		"object|earth / object|moon > property|moon-x",
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
	// - object|earth / object|moon > property|moon-x

	// ---Output---
	// CloneCountResults:
	// - object|earth > earth-clone-count: 4
	// - object|earth / component|planet / object|circle > circle-clone-count: 5
	// - object|earth / object|moon > moon-clone-count: 3

	// AnnotatedPropertyPaths:
	// - object|earth: (4) / object|moon: (3) > property|moon-radius
	// - object|earth: (4) / component|planet > property|planet-velocity
	// - object|earth: (4) / component|planet / object|circle: (5) > property|circle-radius
	// - object|earth: (4) / object|moon: (3) > property|moon-x

	cloneCountResults, annotatedPropertyPaths := e.AnnotateCloneCounts(cloneCountPropertyPaths, propertyPaths)

	if len(cloneCountResults) != 3 {
		t.Errorf("Expected 3 clone count results, got %d", len(cloneCountResults))
	}

	if len(annotatedPropertyPaths) != 4 {
		t.Errorf("Expected 4 annotated property paths, got %d", len(annotatedPropertyPaths))
	}

	expectedCloneCountResults := []string{
		"object|earth > property|earth-clone-count: 4",
		"object|earth / component|planet / object|circle > property|circle-clone-count: 5",
		"object|earth / object|moon > property|moon-clone-count: 3",
	}

	expectedAnnotatedPropertyPaths := []string{
		"object|earth: (4) / component|planet > property|planet-velocity",
		"object|earth: (4) / component|planet / object|circle: (5) > property|circle-radius",
		"object|earth: (4) / object|moon: (3) > property|moon-radius",
		"object|earth: (4) / object|moon: (3) > property|moon-x",
	}

	for i, result := range cloneCountResults {
		if result.String() != expectedCloneCountResults[i] {
			t.Errorf("Expected %s, got %s", expectedCloneCountResults[i], result.String())
		}
	}

	for i, path := range annotatedPropertyPaths {
		if path.String() != expectedAnnotatedPropertyPaths[i] {
			t.Errorf("Expected %s, got %s", expectedAnnotatedPropertyPaths[i], path.String())
		}
	}

	// ------ Test3 ExpandInstancePaths ------

	// ---Input---
	// AnnotatedPropertyPaths:
	// - object|earth: (4) / component|planet > property|planet-velocity
	// - object|earth: (4) / component|planet / object|circle: (5) > property|circle-radius
	// - object|earth: (4) / object|moon: (3) > property|moon-radius
	// - object|earth: (4) / object|moon: (3) > property|moon-x

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

	// PropertyInstancePath: (object|earth: 1 / object|moon: 1 > property|moon-x)
	// PropertyInstancePath: (object|earth: 1 / object|moon: 2 > property|moon-x)
	// PropertyInstancePath: (object|earth: 1 / object|moon: 3 > property|moon-x)

	// PropertyInstancePath: (object|earth: 2 / object|moon: 1 > property|moon-x)
	// PropertyInstancePath: (object|earth: 2 / object|moon: 2 > property|moon-x)
	// PropertyInstancePath: (object|earth: 2 / object|moon: 3 > property|moon-x)

	// PropertyInstancePath: (object|earth: 3 / object|moon: 1 > property|moon-x)
	// PropertyInstancePath: (object|earth: 3 / object|moon: 2 > property|moon-x)
	// PropertyInstancePath: (object|earth: 3 / object|moon: 3 > property|moon-x)

	// PropertyInstancePath: (object|earth: 4 / object|moon: 1 > property|moon-x)
	// PropertyInstancePath: (object|earth: 4 / object|moon: 2 > property|moon-x)
	// PropertyInstancePath: (object|earth: 4 / object|moon: 3 > property|moon-x)

	propertyInstancePaths := e.ExpandInstancePaths(annotatedPropertyPaths)

	if len(propertyInstancePaths) != 48 {
		t.Errorf("Expected 48 property instance paths, got %d", len(propertyInstancePaths))
	}

	expectedPropertyInstancePaths_ := expectedPropertyInstancePaths

	for i, path := range propertyInstancePaths {
		if path.String() != expectedPropertyInstancePaths_[i] {
			t.Errorf("Expected %s, got %s", expectedPropertyInstancePaths_[i], path.String())
		}
	}

	// ------ Test4 EvaluatePropertyInstances ------

	// ---Output---
	// object|earth: 1 / component|planet > property|planet-velocity = 1
	// object|earth: 2 / component|planet > property|planet-velocity = 2
	// object|earth: 3 / component|planet > property|planet-velocity = 3
	// object|earth: 4 / component|planet > property|planet-velocity = 4

	// object|earth: 1 / component|planet / object|circle: 1 > property|circle-radius = 2
	// object|earth: 1 / component|planet / object|circle: 2 > property|circle-radius = 3
	// object|earth: 1 / component|planet / object|circle: 3 > property|circle-radius = 4
	// object|earth: 1 / component|planet / object|circle: 4 > property|circle-radius = 5
	// object|earth: 1 / component|planet / object|circle: 5 > property|circle-radius = 6

	// object|earth: 2 / component|planet / object|circle: 1 > property|circle-radius = 3
	// object|earth: 2 / component|planet / object|circle: 2 > property|circle-radius = 4
	// object|earth: 2 / component|planet / object|circle: 3 > property|circle-radius = 5
	// object|earth: 2 / component|planet / object|circle: 4 > property|circle-radius = 6
	// object|earth: 2 / component|planet / object|circle: 5 > property|circle-radius = 7

	// object|earth: 3 / component|planet / object|circle: 1 > property|circle-radius = 4
	// object|earth: 3 / component|planet / object|circle: 2 > property|circle-radius = 5
	// object|earth: 3 / component|planet / object|circle: 3 > property|circle-radius = 6
	// object|earth: 3 / component|planet / object|circle: 4 > property|circle-radius = 7
	// object|earth: 3 / component|planet / object|circle: 5 > property|circle-radius = 8

	// object|earth: 4 / component|planet / object|circle: 1 > property|circle-radius = 5
	// object|earth: 4 / component|planet / object|circle: 2 > property|circle-radius = 6
	// object|earth: 4 / component|planet / object|circle: 3 > property|circle-radius = 7
	// object|earth: 4 / component|planet / object|circle: 4 > property|circle-radius = 8
	// object|earth: 4 / component|planet / object|circle: 5 > property|circle-radius = 9

	// object|earth: 1 / object|moon: 1 > property|moon-radius = 2
	// object|earth: 1 / object|moon: 2 > property|moon-radius = 3
	// object|earth: 1 / object|moon: 3 > property|moon-radius = 4

	// object|earth: 2 / object|moon: 1 > property|moon-radius = 3
	// object|earth: 2 / object|moon: 2 > property|moon-radius = 4
	// object|earth: 2 / object|moon: 3 > property|moon-radius = 5

	// object|earth: 3 / object|moon: 1 > property|moon-radius = 4
	// object|earth: 3 / object|moon: 2 > property|moon-radius = 5
	// object|earth: 3 / object|moon: 3 > property|moon-radius = 6

	// object|earth: 4 / object|moon: 1 > property|moon-radius = 5
	// object|earth: 4 / object|moon: 2 > property|moon-radius = 6
	// object|earth: 4 / object|moon: 3 > property|moon-radius = 7

	// object|earth: 1 / object|moon: 1 > property|moon-x = 7
	// object|earth: 1 / object|moon: 2 > property|moon-x = 7
	// object|earth: 1 / object|moon: 3 > property|moon-x = 7

	// object|earth: 2 / object|moon: 1 > property|moon-x = 7
	// object|earth: 2 / object|moon: 2 > property|moon-x = 7
	// object|earth: 2 / object|moon: 3 > property|moon-x = 7

	// object|earth: 3 / object|moon: 1 > property|moon-x = 7
	// object|earth: 3 / object|moon: 2 > property|moon-x = 7
	// object|earth: 3 / object|moon: 3 > property|moon-x = 7

	// object|earth: 4 / object|moon: 1 > property|moon-x = 7
	// object|earth: 4 / object|moon: 2 > property|moon-x = 7
	// object|earth: 4 / object|moon: 3 > property|moon-x = 7

	propertyInstanceResults := e.EvaluatePropertyInstances(propertyInstancePaths, propertyPaths)

	if len(propertyInstanceResults) != len(propertyInstancePaths) {
		t.Errorf("Expected %d property instance results, got %d", len(propertyInstancePaths), len(propertyInstanceResults))
	}

	expectedPropertyInstanceResults_ := expectedPropertyInstanceResults

	for i, result := range propertyInstanceResults {
		if result.String() != expectedPropertyInstanceResults_[i] {
			t.Errorf("Index %v: Expected %s, got %s", i, expectedPropertyInstanceResults_[i], result.String())
		}
	}

	// ------ Test5 GroupObjectInstances ------

	objectInstanceResults := e.GroupObjectInstances(propertyInstanceResults)

	expectedObjectInstanceResults_ := expectedObjectInstanceResults
	if len(objectInstanceResults) != len(expectedObjectInstanceResults_) {
		t.Errorf("Expected %d object instance results, got %d", len(expectedObjectInstanceResults_), len(objectInstanceResults))
	}

	for i, result := range objectInstanceResults {
		if result.String() != expectedObjectInstanceResults_[i] {
			t.Errorf("\nIndex: %v\nExpected:\n%s\nGot:\n%s", i, expectedObjectInstanceResults_[i], result.String())
		}
	}

	for _, result := range objectInstanceResults {
		t.Log(result.String())
	}

	// ------ Test6 Create Final Result ------

	finalOutput := e.CreateFinalResult(objectInstanceResults)

	expectedFinalResults_ := expectedFinalResults
	if !reflect.DeepEqual(finalOutput, expectedFinalResults_) {
		t.Errorf("Final output does not match expected output.\nExpected: %+v\nGot: %+v", expectedFinalResults_, finalOutput)
	}

	for _, result := range finalOutput {
		t.Logf("Final Result: %+v", result)
	}
}
