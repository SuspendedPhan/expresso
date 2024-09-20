package evaluator

import (
	"strconv"

	"github.com/davecgh/go-spew/spew"
)

func (e *Evaluator) Eval() *Evaluation {
	evaluation := &Evaluation{
		resultByCanvasPropertyPath: make(map[string]Float),
	}

	for _, exObjectId := range e.RootExObjectIds {
		exObject, found := e.ExObjectById[exObjectId]
		if !found {
			panic("exObject not found " + exObjectId)
		}

		cloneCount := e.evalCloneCount(exObject)
		cloneCountCanvasPropertyPath := CreateCloneCountCanvasPropertyPath("", exObject.Id, exObject.CloneCountPropertyId)
		evaluation.resultByCanvasPropertyPath[cloneCountCanvasPropertyPath] = cloneCount
		for i := 0; i < int(cloneCount); i++ {
			canvasObjectPath := CanvasObjectPathAppend("", exObject.Id, strconv.Itoa(i))
			for _, propertyId := range exObject.ComponentParameterPropertyIds {
				property := e.getProperty(propertyId)
				value := e.EvalExpr(property.ExprId)
				canvasPropertyPath := CreateCanvasPropertyPath(property.Id, canvasObjectPath)
				evaluation.resultByCanvasPropertyPath[canvasPropertyPath] = value + value*Float(i)
			}
		}
	}
	spew.Dump(e)
	// spew.Dump(evaluation)
	return evaluation
}

func (e *Evaluator) evalCloneCount(exObject *ExObject) Float {
	if exObject.CloneCountPropertyId == "" {
		panic("CloneCountProperty not set for exObject: " + exObject.Id)
	}
	property := e.getProperty(exObject.CloneCountPropertyId)
	count := e.EvalExpr(property.ExprId)
	return count
}

func (e *Evaluator) getProperty(propertyId string) *Property {
	property, found := e.PropertyById[propertyId]
	if !found {
		panic("property not found " + propertyId)
	}
	return property
}

type Evaluation struct {
	resultByCanvasPropertyPath map[string]Float
}

func (e *Evaluation) GetResult(canvasPropertyPath string) Float {
	v, ok := e.resultByCanvasPropertyPath[canvasPropertyPath]
	if !ok {
		panic("No value for canvasPropertyPath: " + canvasPropertyPath)
	}
	return v
}
