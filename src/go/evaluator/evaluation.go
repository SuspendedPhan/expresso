package evaluator

import "strconv"

type Component struct {
	Id           string
	Clones       int
	AttributeIds []string
}

type Attribute struct {
	Id     string
	ExprId string
}

func (e *Evaluator) Eval() *Evaluation {
	evaluation := &Evaluation{
		valueByAttributeSceneInstancePath: make(map[string]Float),
	}

	for _, component := range e.RootComponentById {
		for i := 0; i < component.Clones; i++ {
			sceneInstancePath := SceneInstancePathAppend("", component.Id, strconv.Itoa(i))
			for _, attributeId := range component.AttributeIds {
				attribute := e.AttributeById[attributeId]
				value := e.EvalExpr(attribute.ExprId)
				attributeSceneInstancePath := CreateAttributeSceneInstancePath(attributeId, sceneInstancePath)
				evaluation.valueByAttributeSceneInstancePath[attributeSceneInstancePath] = value
			}
		}
	}
	return evaluation
}

type Evaluation struct {
	valueByAttributeSceneInstancePath map[string]Float
}

func (e *Evaluation) GetValue(attributeSceneInstancePath string) Float {
	v, ok := e.valueByAttributeSceneInstancePath[attributeSceneInstancePath]
	if !ok {
		panic("No value for attributeSceneInstancePath: " + attributeSceneInstancePath)
	}
	return v
}
