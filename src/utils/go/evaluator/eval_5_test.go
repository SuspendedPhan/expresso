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
//         - property|x
//

func TestEval5(t *testing.T) {
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
}
