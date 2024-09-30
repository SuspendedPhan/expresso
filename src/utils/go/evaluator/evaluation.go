package evaluator

import (
	"errors"
	"fmt"
	"strconv"

	"github.com/davecgh/go-spew/spew"
)

var (
	DexError = errors.New("DexError")
)

type EvaluationCtx_ struct {
	evaluation *Evaluation
}

func (e *Evaluator) Eval() *Evaluation {
	evaluation := &Evaluation{
		resultByCanvasPropertyPath: make(map[string]Float),
	}

	ctx := &EvaluationCtx_{
		evaluation: evaluation,
	}

	for _, exObjectId := range e.RootExObjectIds {
		exObject, found := e.ExObjectById[exObjectId]
		if !found {
			spew.Dump(e)
			panic("exObject not found " + exObjectId)
		}

		cloneCount := e.evalCloneCount(ctx, exObject)
		cloneCountCanvasPropertyPath := CreateCloneCountCanvasPropertyPath("", exObject.Id, exObject.CloneCountPropertyId)
		evaluation.resultByCanvasPropertyPath[cloneCountCanvasPropertyPath] = cloneCount
		for i := 0; i < int(cloneCount); i++ {
			canvasObjectPath := CanvasObjectPathAppend("", exObject.Id, strconv.Itoa(i))
			for _, propertyId := range exObject.ComponentParameterPropertyIds {
				property := e.getProperty(propertyId)
				value := e.EvalExpr(ctx, property.ExprId)
				canvasPropertyPath := CreateCanvasPropertyPath(property.Id, canvasObjectPath)
				evaluation.resultByCanvasPropertyPath[canvasPropertyPath] = value + value*Float(i)
			}
		}
	}
	// spew.Dump(e)
	// spew.Dump(evaluation)
	return evaluation
}

func (e *Evaluator) evalCloneCount(ctx *EvaluationCtx_, exObject *ExObject) Float {
	if exObject.CloneCountPropertyId == "" {
		// panic(fmt.Errorf("%w: CloneCountProperty not set for exObject: %s", DexError, exObject.Id))
		panic("CloneCountProperty not set for exObject: " + exObject.Id)
	}
	property := e.getProperty(exObject.CloneCountPropertyId)
	count := e.EvalExpr(ctx, property.ExprId)
	return count
}

func (e *Evaluator) getProperty(propertyId string) *Property {
	property, found := e.PropertyById[propertyId]
	if !found {
		// panic(fmt.Errorf("%w: Property not found: %s", DexError, propertyId))
		panic("property not found " + propertyId)
	}
	return property
}

type Evaluation struct {
	resultByCanvasPropertyPath map[string]Float
}

func (e *Evaluation) GetResult(canvasPropertyPath string) (Float, error) {
	v, ok := e.resultByCanvasPropertyPath[canvasPropertyPath]
	if !ok {
		logger.Error("No value for canvasPropertyPath: " + canvasPropertyPath)
		return 0, fmt.Errorf("%w: No value for canvasPropertyPath: %s", DexError, canvasPropertyPath)
		// panic(fmt.Errorf("%w: No value for canvasPropertyPath: %s", DexError, canvasPropertyPath))
		// panic("No value for canvasPropertyPath: " + canvasPropertyPath)
	}
	return v, nil
}
