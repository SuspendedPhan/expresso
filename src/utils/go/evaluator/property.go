package evaluator

type Property struct {
	Id           string
	ExprId       string
	PropertyType string
}

func (e *Evaluator) PropertySetExpr(propertyId string, exprId string) {
	property, found := e.PropertyById[propertyId]

	if !found {
		panic("property not found")
	}

	property.ExprId = exprId
}
