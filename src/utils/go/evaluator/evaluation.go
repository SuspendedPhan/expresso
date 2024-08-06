package evaluator

import (
	"strconv"
)

func (e *Evaluator) Eval() *Evaluation {
	evaluation := &Evaluation{
		resultByCanvasPropertyPath: make(map[string]Float),
	}

	for _, exObjectId := range e.RootExObjectIds {
		exObject := e.ExObjectById[exObjectId]
		cloneCount := e.evalCloneCount(exObject)
		for i := 0; i < exObject.CloneCount; i++ {
			canvasObjectPath := CanvasObjectPathAppend("", exObject.Id, strconv.Itoa(i))
			for _, property := range exObject.PropertyById {
				value := e.EvalExpr(property.ExprId)
				canvasPropertyPath := CreateCanvasPropertyPath(property.Id, canvasObjectPath)
				evaluation.resultByCanvasPropertyPath[canvasPropertyPath] = value + value*Float(i)
			}
		}
	}
	// spew.Dump(evaluation)
	return evaluation
}

func (e *Evaluator) evalCloneCount(exObject *ExObject) *Evaluation {

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
