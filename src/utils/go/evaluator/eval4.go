package evaluator

func (e *Evaluator) EvaluatePropertyInstances(paths []*PropertyInstancePath) []*PropertyInstanceResult {
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

	for _, path := range paths {
		pathString := path.String()
		if resultByPropertyInstancePath[pathString] != nil {
			continue
		}

		result := e.EvaluatePropertyInstancePath(path, resultByPropertyInstancePath)
		resultByPropertyInstancePath[pathString] = result
	}

	results := make([]*PropertyInstanceResult, 0, len(resultByPropertyInstancePath))

	for _, value := range resultByPropertyInstancePath {
		results = append(results, value)
	}

	return results
}

func (e *Evaluator) EvaluatePropertyInstancePath(path *PropertyInstancePath, resultByPropertyInstancePath map[string]*PropertyInstanceResult) *PropertyInstanceResult {
	// last segment
	segment := path.segments[len(path.segments)-1]
	property, ok := segment.exItem.(*Property)
	if !ok {
		panic("last segment is not a property")
	}
	expr := property.Expr()

}

func (e *Evaluator) EvalExpr(ctx *EvaluationCtx_, exprId string) Float {
	// expr := e.ExprById[exprId]
	// return e.EvalExpr(ctx, expr)
	return 0
}
