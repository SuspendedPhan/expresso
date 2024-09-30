// property.go

package evaluator

type Property struct {
	Id           string
	ExprId       string
	PropertyType string
	Evaluator    *Evaluator
}

func (e *Evaluator) PropertyCreate(propertyId string) {
	e.PropertyById[propertyId] = &Property{
		Id:        propertyId,
		Evaluator: e,
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

func (self *Property) Expr() *Expr {
	expr, found := self.Evaluator.ExprById[self.ExprId]

	if !found {
		panic("expr not found")
	}

	return expr
}

func (self *Property) GetPropertyPath() *PropertyPath {
	panic("not implemented")
}
