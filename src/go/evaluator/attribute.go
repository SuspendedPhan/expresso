package evaluator

type Attribute struct {
	Id     string
	ExprId string
}

func (e *Evaluator) SetExpr(componentId string, attributeId string, exprId string) {
	component, found := e.RootComponentById[componentId]

	if !found {
		panic("component not found")
	}

	attribute, found := component.AttributeById[attributeId]

	if !found {
		panic("attribute not found")
	}

	attribute.ExprId = exprId
}
