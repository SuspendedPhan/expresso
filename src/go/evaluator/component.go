package evaluator

type Component struct {
	Id           string
	Clones       int
	AttributeIds []string
}

type Attribute struct {
	Id     string
	ExprId string
}

type Result struct {
	valueByAttributeSceneInstancePath map[string]Float
}

func (e *Evaluator) EvalComponent(componentId string, result *Result) {
}
