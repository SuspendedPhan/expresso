package evaluator

type Property struct {
	Id     string
	ExprId string
}

func (e *Evaluator) PropertySetExpr(exObjectId string, propertyId string, exprId string) {
	exObject, found := e.ExObjectById[exObjectId]

	if !found {
		panic("exObject not found")
	}

	property, found := exObject.PropertyById[propertyId]

	if !found {
		panic("property not found")
	}

	property.ExprId = exprId
}
