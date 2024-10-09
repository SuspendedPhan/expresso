// File: reference_expr.go

package evaluator

import "fmt"

func (e *Evaluator) ReferenceExprCreate(id string) {
	r := &ReferenceExpr{
		TargetId:   "uninitialized",
		TargetKind: "uninitialized",
		Evaluator:  e,
		Expr:       nil,
	}
	e1 := &Expr{
		Id:            id,
		ReferenceExpr: r,
	}
	r.Expr = e1
	e.ExprById[id] = e1
}

func (e *Evaluator) ReferenceExprSetTargetId(id string, targetId string) {
	expr, found := e.ExprById[id]
	if !found {
		panic("expr not found")
	}
	refExpr := expr.ReferenceExpr
	if refExpr == nil {
		panic("expr is not a reference expr")
	}

	refExpr.TargetId = targetId
}

// targetKind can be
// - Property/ComponentParameterProperty
// - Property/BasicProperty
// - Property/CloneCountProperty
// - ComponentParameter/Custom
// - ExFuncParameter
// - CloneNumberTarget
func (e *Evaluator) ReferenceExprSetTargetKind(id string, targetKind string) {
	expr, found := e.ExprById[id]
	if !found {
		panic("expr not found " + id)
	}
	refExpr := expr.ReferenceExpr
	if refExpr == nil {
		panic("expr is not a reference expr")
	}

	refExpr.TargetKind = targetKind
}

func (expr *ReferenceExpr) GetTargetInstancePath(ctx *EvaluationCtx, exprInstancePath *PropertyInstancePath) *PropertyInstancePath {
	targetProperty := expr.GetTargetProperty()
	targetPath := ctx.GetPropertyPath(targetProperty)

	// fmt.Printf("GetTargetInstancePath %v /// %v\n", expr, targetPath.Property().Id)
	// fmt.Println(exprInstancePath)
	// fmt.Println(targetPath)

	// For each matching segment, create an instance segment from the exprInstancePath
	targetInstanceSegments := make([]*PropertyInstancePathSegment, 0)
	for i, targetSegment := range targetPath.segments {
		exprInstancePathSegment := exprInstancePath.segments[i]
		if targetSegment.IsExObject() {
			if targetSegment.exItem != exprInstancePathSegment.exItem {
				panic(fmt.Errorf("mismatch: index %v: expected target segment %v to match expr segment %v", i, targetSegment.exItem.Name(), exprInstancePathSegment.exItem.Name()))
			}

			targetInstanceSegment := &PropertyInstancePathSegment{
				exItem:      targetSegment.exItem,
				cloneNumber: exprInstancePathSegment.cloneNumber,
			}
			targetInstanceSegments = append(targetInstanceSegments, targetInstanceSegment)
		} else {
			targetInstanceSegment := &PropertyInstancePathSegment{
				exItem:      targetSegment.exItem,
				cloneNumber: -1,
			}
			targetInstanceSegments = append(targetInstanceSegments, targetInstanceSegment)
		}
	}

	return &PropertyInstancePath{
		segments: targetInstanceSegments,
	}
}

func (expr *ReferenceExpr) GetTargetProperty() *Property {
	targetId := expr.TargetId
	targetKind := expr.TargetKind
	if targetKind == "Property/BasicProperty" || targetKind == "Property/CloneCountProperty" || targetKind == "Property/ComponentParameter" {
		targetProperty, found := expr.Evaluator.PropertyById[targetId]
		if !found {
			panic(fmt.Errorf("target property not found for reference expr: %v, %v", targetId, expr))
		}
		return targetProperty
	}

	panic("unknown target kind")
}

func (expr *ReferenceExpr) GetCloneNumberTargetParent() (*ExObject, bool) {
	if expr.TargetKind != "CloneNumberTarget" {
		return nil, false
	}

	exObjectId, found := expr.Evaluator.ExObjectIdByCloneNumberTargetId[expr.TargetId]
	if !found {
		panic(fmt.Errorf("ex object for target not found: %v", expr.TargetId))
	}

	exObject, found := expr.Evaluator.ExObjectById[exObjectId]
	if !found {
		panic(fmt.Errorf("ex object for target was found, but ex object not found: %v", exObjectId))
	}

	return exObject, true
}

func (expr *ReferenceExpr) GetCloneCountResult(ctx *EvaluationCtx) (*CloneCountResult, bool) {
	if expr.TargetKind != "Property/CloneCountProperty" {
		return nil, false
	}

	for _, cloneCountResult := range ctx.cloneCountResults {
		if cloneCountResult.PropertyPath.Property().Id == expr.TargetId {
			return cloneCountResult, true
		}
	}
	panic(fmt.Errorf("clone count result not found for target: %v", expr.TargetId))
}

func (expr *ReferenceExpr) String() string {
	return expr.Expr.Id
}

func (expr *ReferenceExpr) GetComponentParameterValue(ctx *EvaluationCtx) (DexValue, bool) {
	if expr.TargetKind != "ComponentParameter/Custom" {
		return 0, false
	}

	value, found := ctx.scopedValueByComponentParameterId[expr.TargetId]
	if !found {
		panic(fmt.Errorf("component parameter not found: %v", expr.TargetId))
	}

	// todp: set the scoped value somewhere

	return value, true
}
