package evaluator

import "fmt"

func (e *Evaluator) EvaluatePropertyInstances(
	instancePaths []*PropertyInstancePath,
	paths []*PropertyPath,
) []*PropertyInstanceResult {
	/*
	   results: Map<PropertyInstancePath, PropertyInstanceResult>

	   for path in PropertyInstancePaths:
	       if path in results:
	           continue

	       result = EvaluatePropertyInstancePath(path)
	       results.append(result)

	   function EvaluatePropertyInstancePath(PropertyInstancePath):
	       if results contains PropertyInstancePath:
	           return results[PropertyInstancePath]

	       value = PropertyInstance.Evaluate()
	       return PropertyInstanceResult(PropertyInstancePath, value)

	   yield* results
	*/

	resultByPropertyInstancePath := make(map[string]*PropertyInstanceResult)
	evaluationCtx := &EvaluationCtx{
		resultByPropertyInstancePath: resultByPropertyInstancePath,
		propertyPathByProperty:       MakePropertyPathMap(paths),
	}

	results := make([]*PropertyInstanceResult, 0, len(resultByPropertyInstancePath))

	for i, path := range instancePaths {
		fmt.Printf("Evaluating instance path %v: %v\n", i, path)
		result := e.EvaluatePropertyInstancePath(evaluationCtx, path)
		results = append(results, result)
	}

	return results
}

func (e *Evaluator) EvaluatePropertyInstancePath(ctx *EvaluationCtx, path *PropertyInstancePath) *PropertyInstanceResult {
	if result, found := ctx.GetPropertyInstanceResult(path); found {
		return result
	}

	// Get last segment
	segment := path.segments[len(path.segments)-1]
	property, ok := segment.exItem.(*Property)
	if !ok {
		panic("last segment is not a property")
	}
	expr := property.Expr()
	value := e.EvalExpr(ctx, expr, path)
	result := &PropertyInstanceResult{
		Path:  path,
		Value: value,
	}

	ctx.SetPropertyInstanceResult(path, result)
	return result
}

func (e *Evaluator) EvalExpr(ctx *EvaluationCtx, expr *Expr, path *PropertyInstancePath) DexValue {
	fmt.Println("EvalExpr expr:", expr)

	if expr.NumberExpr != nil {
		fmt.Println("EvalExpr number result:", expr.NumberExpr.Value)
		return expr.NumberExpr.Value
	}
	if expr.CallExpr != nil {
		result := e.EvalCallExpr(ctx, expr.CallExpr, path)
		fmt.Println("EvalExpr call result:", result)
		return result
	}
	if expr.ReferenceExpr != nil {
		result := e.EvalReferenceExpr(ctx, expr.ReferenceExpr, path)
		fmt.Println("EvalExpr reference result:", result)
		return result
	}
	panic("unknown expr")
}

func (e *Evaluator) EvalCallExpr(ctx *EvaluationCtx, callExpr *CallExpr, path *PropertyInstancePath) DexValue {
	return e.EvalExpr(ctx, callExpr.Arg0(), path) + e.EvalExpr(ctx, callExpr.Arg1(), path)
}

func (e *Evaluator) EvalReferenceExpr(ctx *EvaluationCtx, referenceExpr *ReferenceExpr, path *PropertyInstancePath) DexValue {
	targetKind := referenceExpr.TargetKind
	if targetKind == "Property/BasicProperty" || targetKind == "Property/ComponentParameter" {
		targetInstancePath := referenceExpr.GetTargetInstancePath(ctx, path)
		result := e.EvaluatePropertyInstancePath(ctx, targetInstancePath)
		return result.Value
	}

	cloneNumberTarget, ok := referenceExpr.GetCloneNumberTarget()
	if ok {
		fmt.Println("EvalReferenceExpr cloneNumberTarget:", cloneNumberTarget)
		result := ctx.GetCloneNumber(cloneNumberTarget, path)
		return Float(result)
	}

	panic("unknown reference kind")
}

func MakePropertyPathMap(paths []*PropertyPath) map[*Property]*PropertyPath {
	result := make(map[*Property]*PropertyPath)
	for _, path := range paths {
		property := path.Property()
		result[property] = path
	}
	return result
}
