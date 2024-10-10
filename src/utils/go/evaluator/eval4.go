package evaluator

import (
	"fmt"
	"math"
)

func (e *Evaluator) EvaluatePropertyInstances(
	instancePaths []*PropertyInstancePath,
	paths []*PropertyPath,
	cloneCountResults []*CloneCountResult,
	globalPropertyValueById map[string]DexValue,
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
		resultByPropertyInstancePath:            resultByPropertyInstancePath,
		propertyPathByProperty:                  MakePropertyPathMap(paths),
		cloneCountResults:                       cloneCountResults,
		evaluator:                               e,
		scopedParameterValueByExFuncParameterId: make(map[string]DexValue),
		globalPropertyValueByPropertyId:         globalPropertyValueById,
	}

	results := make([]*PropertyInstanceResult, 0, len(resultByPropertyInstancePath))

	for _, path := range instancePaths {
		// fmt.Printf("Evaluating instance path %v: %v\n", i, path)
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
	// fmt.Println("EvalExpr expr:", expr)

	if expr.NumberExpr != nil {
		// fmt.Println("EvalExpr number result:", expr.NumberExpr.Value)
		return expr.NumberExpr.Value
	}
	if expr.CallExpr != nil {
		result := e.EvalCallExpr(ctx, expr.CallExpr, path)
		// fmt.Println("EvalExpr call result:", result)
		return result
	}
	if expr.ReferenceExpr != nil {
		result := e.EvalReferenceExpr(ctx, expr.ReferenceExpr, path)
		// fmt.Println("EvalExpr reference result:", result)
		return result
	}
	panic("unknown expr")
}

func (e *Evaluator) EvalCallExpr(ctx *EvaluationCtx, callExpr *CallExpr, path *PropertyInstancePath) DexValue {
	args := callExpr.Args()

	if callExpr.exFuncType == "ExFunc.Custom" {
		paramIds := callExpr.ExFunc().ParameterIds
		if len(paramIds) != len(args) {
			panic(fmt.Errorf("expected %v args, got %v", len(paramIds), len(args)))
		}

		for i, arg := range args {
			paramId := paramIds[i]
			value := e.EvalExpr(ctx, arg, path)
			ctx.SetExFuncParameterValue(paramId, value)
		}

		exFunc := callExpr.ExFunc()
		rootExpr := exFunc.Expr()
		value := e.EvalExpr(ctx, rootExpr, path)
		for _, id := range paramIds {
			ctx.DeleteExFuncParameterValue(id)
		}

		return value
	}

	if len(args) != 2 {
		panic(fmt.Errorf("expected 2 args, got %v", len(args)))
	}

	arg0 := e.EvalExpr(ctx, args[0], path)
	arg1 := e.EvalExpr(ctx, args[1], path)

	switch callExpr.exFuncId {
	case "Add":
		return arg0 + arg1
	case "Subtract":
		return arg0 - arg1
	case "Multiply":
		return arg0 * arg1
	case "Divide":
		return arg0 / arg1
	case "Modulo":
		return math.Mod(arg0, arg1)
	default:
		panic(fmt.Errorf("unknown exFunc type: %v", callExpr.exFuncType))
	}
}

func (e *Evaluator) EvalReferenceExpr(ctx *EvaluationCtx, referenceExpr *ReferenceExpr, path *PropertyInstancePath) DexValue {
	targetKind := referenceExpr.TargetKind
	if targetKind == "Property/BasicProperty" || targetKind == "Property/ComponentParameter" {
		targetInstancePath := referenceExpr.GetTargetInstancePath(ctx, path)
		result := e.EvaluatePropertyInstancePath(ctx, targetInstancePath)
		return result.Value
	}

	cloneNumberTarget, ok := referenceExpr.GetCloneNumberTargetParent()
	if ok {
		// fmt.Println("EvalReferenceExpr cloneNumberTarget:", cloneNumberTarget)
		result := ctx.GetCloneNumber(cloneNumberTarget, path)
		return Float(result)
	}

	if cloneCountResult, ok := referenceExpr.GetCloneCountResult(ctx); ok {
		return cloneCountResult.Count
	}

	if componentParameterPropertyInstancePath, ok := referenceExpr.GetComponentParameterPropertyInstancePath(ctx, path); ok {
		result := e.EvaluatePropertyInstancePath(ctx, componentParameterPropertyInstancePath)
		return result.Value
	}

	if exFuncParameterValue, ok := referenceExpr.GetExFuncParameterValue(ctx); ok {
		return exFuncParameterValue
	}

	if globalPropertyValue, ok := referenceExpr.GetGlobalPropertyValue(ctx); ok {
		return globalPropertyValue
	}

	panic(fmt.Errorf("unknown reference kind: %v", targetKind))
}

func MakePropertyPathMap(paths []*PropertyPath) map[*Property]*PropertyPath {
	result := make(map[*Property]*PropertyPath)
	for _, path := range paths {
		property := path.Property()
		result[property] = path
	}
	return result
}
