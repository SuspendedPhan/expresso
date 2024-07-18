package evaluator

import (
	"strconv"
)

func (e *Evaluator) Eval() *Evaluation {
	evaluation := &Evaluation{
		resultByAttributeSceneInstancePath: make(map[string]Float),
	}

	for _, component := range e.RootComponentById {
		for i := 0; i < component.CloneCount; i++ {
			sceneInstancePath := SceneInstancePathAppend("", component.Id, strconv.Itoa(i))
			for _, attribute := range component.AttributeById {
				value := e.EvalExpr(attribute.ExprId)
				attributeSceneInstancePath := CreateAttributeSceneInstancePath(attribute.Id, sceneInstancePath)
				evaluation.resultByAttributeSceneInstancePath[attributeSceneInstancePath] = value
			}
		}
	}
	// spew.Dump(evaluation)
	return evaluation
}

type Evaluation struct {
	resultByAttributeSceneInstancePath map[string]Float
}

func (e *Evaluation) GetResult(attributeSceneInstancePath string) Float {
	v, ok := e.resultByAttributeSceneInstancePath[attributeSceneInstancePath]
	if !ok {
		panic("No value for attributeSceneInstancePath: " + attributeSceneInstancePath)
	}
	return v
}
