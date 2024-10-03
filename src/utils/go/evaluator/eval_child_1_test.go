// File: eval_child_1_test.go

package evaluator_test

import (
	"testing"

	"expressioni.sta/evaluator"
)

// ---Input---
// Evaluator:
//   RootExObjectIds (1):
//     - "ex-object-earth"

//   ComponentById: {}

//   ExObjectById (2):
//     "ex-object-earth":
//       Id: "ex-object-earth"
//       ComponentParameterPropertyIds (1):
//         - "component-parameter-alpha"
//       CloneCountPropertyId: "clone-count-property-earth"
//       BasicPropertyIds: []
//       ComponentId: ""
//       ChildrenIds (1):
//         - "ex-object-moon"

//     "ex-object-moon":
//       Id: "ex-object-moon"
//       ComponentParameterPropertyIds (1):
//         - "component-parameter-beta"
//       CloneCountPropertyId: "clone-count-property-moon"
//       BasicPropertyIds: []
//       ComponentId: ""
//       ChildrenIds: null

//   PropertyById (4):
//     "clone-count-property-earth":
//       Id: "clone-count-property-earth"
//       ExprId: "expr-earth-ref"
//     "component-parameter-alpha":
//       Id: "component-parameter-alpha"
//       ExprId: "expr-alpha"
//     "clone-count-property-moon":
//       Id: "clone-count-property-moon"
//       ExprId: "expr-moon-ref"
//     "component-parameter-beta":
//       Id: "component-parameter-beta"
//       ExprId: "expr-beta"

//   ExprById (4):
//     "expr-earth-ref":
//       Expr:
//         Id: "expr-earth-ref"
//         NumberExpr: null
//         CallExpr: null
//         ReferenceExpr:
//           TargetId: "clone-number-target-earth"
//           TargetKind: "CloneNumberTarget"
//         Evaluator: null

//     "expr-alpha":
//       Expr:
//         Id: "expr-alpha"
//         NumberExpr: null
//         CallExpr: null
//         ReferenceExpr: null
//         Evaluator: null

//     "expr-moon-ref":
//       Expr:
//         Id: "expr-moon-ref"
//         NumberExpr: null
//         CallExpr: null
//         ReferenceExpr: null
//         Evaluator: null

//     "expr-beta":
//       Expr:
//         Id: "expr-beta"
//         NumberExpr: null
//         CallExpr: null
//         ReferenceExpr: null
//         Evaluator: null

// ExObjectIdByCloneNumberTargetId (2):
//
//	"clone-number-target-earth": "ex-object-earth"
//	"clone-number-target-moon": "ex-object-moon"

func TestEvalChild(t *testing.T) {
	// ------ Setup Evaluator ------

	// Initialize the Evaluator with a NoopLogger
	e := evaluator.NewEvaluator(&evaluator.NoopLogger{})

	// --- Create ExObjects ---
	// RootExObjectIds (1):
	// - "ex-object-earth"

	e.ExObjectCreate("ex-object-earth")
	e.ExObjectCreate("ex-object-moon")

	// --- Create Properties ---
	// PropertyById (4):
	// - "clone-count-property-earth"
	// - "component-parameter-alpha"
	// - "clone-count-property-moon"
	// - "component-parameter-beta"

	e.PropertyCreate("clone-count-property-earth")
	e.PropertyCreate("component-parameter-alpha")
	e.PropertyCreate("clone-count-property-moon")
	e.PropertyCreate("component-parameter-beta")

	// --- Create Expressions ---
	// ExprById (4):
	// - "expr-earth-ref"
	// - "expr-alpha"
	// - "expr-moon-ref"
	// - "expr-beta"

	// Create Reference Expression for "expr-earth-ref"
	e.ReferenceExprCreate("expr-earth-ref")
	e.ReferenceExprSetTargetId("expr-earth-ref", "clone-number-target-earth")
	e.ReferenceExprSetTargetKind("expr-earth-ref", "CloneNumberTarget")

	// Create empty expressions for "expr-alpha", "expr-moon-ref", "expr-beta"
	e.ExprCreateEmpty("expr-alpha")
	e.ExprCreateEmpty("expr-moon-ref")
	e.ExprCreateEmpty("expr-beta")

	// --- Assign Expressions to Properties ---
	e.PropertySetExpr("clone-count-property-earth", "expr-earth-ref")
	e.PropertySetExpr("component-parameter-alpha", "expr-alpha")
	e.PropertySetExpr("clone-count-property-moon", "expr-moon-ref")
	e.PropertySetExpr("component-parameter-beta", "expr-beta")

	// --- Set Clone Number Targets ---
	// ExObjectIdByCloneNumberTargetId (2):
	// - "clone-number-target-earth": "ex-object-earth"
	// - "clone-number-target-moon": "ex-object-moon"

	e.ExObjectSetCloneNumberTarget("ex-object-earth", "clone-number-target-earth")
	e.ExObjectSetCloneNumberTarget("ex-object-moon", "clone-number-target-moon")

	// --- Set Relationships ---
	// "ex-object-earth" has "ex-object-moon" as a child
	e.ExObjectAddChild("ex-object-earth", "ex-object-moon")

	// Add "ex-object-earth" as a root ExObject
	e.AddRootExObject("ex-object-earth")
}
