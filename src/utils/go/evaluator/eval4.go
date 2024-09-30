package evaluator

func (e *Evaluator) EvaluatePropertyInstances(cloneCountResults []*CloneCountResult, paths []*PropertyInstancePath) []*PropertyInstanceResult {
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
	}

	for _, path := range paths {
		e.EvaluatePropertyInstancePath(evaluationCtx, path)
	}

	results := make([]*PropertyInstanceResult, 0, len(resultByPropertyInstancePath))

	for _, value := range resultByPropertyInstancePath {
		results = append(results, value)
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

func (e *Evaluator) EvalExpr(ctx *EvaluationCtx, expr *Expr, path *PropertyInstancePath) Float {
	if expr.NumberExpr != nil {
		return expr.NumberExpr.Value
	}
	if expr.CallExpr != nil {
		return e.EvalCallExpr(ctx, expr.CallExpr, path)
	}
	if expr.ReferenceExpr != nil {
		return e.EvalReferenceExpr(ctx, expr.ReferenceExpr, path)
	}
	panic("unknown expr")
}

func (e *Evaluator) EvalCallExpr(ctx *EvaluationCtx, callExpr *CallExpr, path *PropertyInstancePath) Float {
	return e.EvalExpr(ctx, callExpr.Arg0(), path) + e.EvalExpr(ctx, callExpr.Arg1(), path)
}

func (e *Evaluator) EvalReferenceExpr(ctx *EvaluationCtx, referenceExpr *ReferenceExpr, path *PropertyInstancePath) Float {
	targetId := referenceExpr.TargetId
	targetKind := referenceExpr.TargetKind
	if targetKind == "Property/BasicProperty" {
		targetProperty, found := e.PropertyById[targetId]
		if !found {
			panic("property not found")
		}
		targetInstancePath := targetProperty.GetPropertyInstancePathFrom(path)
		result := e.EvaluatePropertyInstancePath(ctx, targetInstancePath)
		return result.Value
	}

	if targetKind == "Property/CloneCountProperty" {
		targetProperty, found := e.PropertyById[targetId]
		if !found {
			panic("property not found")
		}
		result := ctx.GetCloneCountResult(targetProperty)
		return Float(result.Count)
	}

	panic("unknown reference kind")
}
