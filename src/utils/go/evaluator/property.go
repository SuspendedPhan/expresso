// property.go

package evaluator

type Property struct {
	Id           string
	ExprId       string
	PropertyType string
}

func (e *Evaluator) PropertyCreate(propertyId string) {
	e.PropertyById[propertyId] = &Property{
		Id: propertyId,
	}
}

func (e *Evaluator) PropertySetExpr(propertyId string, exprId string) {
	property, found := e.PropertyById[propertyId]

	if !found {
		panic("property not found")
	}

	property.ExprId = exprId
}

func (self *Property) Name() string {
	return self.Id
}
