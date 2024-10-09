package evaluator

type CustomExFunc struct {
	Id        string
	Evaluator *Evaluator

	ExprId       string
	ParameterIds []string
}

func (e *Evaluator) ExFuncCreate(id string) {
	if _, exists := e.ExFuncById[id]; exists {
		println("Warning: ExFunc with this ID already exists")
	}

	e.ExFuncById[id] = &CustomExFunc{
		Id:        id,
		Evaluator: e,
	}
}

func (e *Evaluator) ExFuncSetExpr(id string, exprId string) {
	exFunc, found := e.ExFuncById[id]

	if !found {
		panic("ExFunc not found")
	}

	exFunc.ExprId = exprId
}

func (e *Evaluator) ExFuncSetParameters(id string, parameterIds []string) {
	exFunc, found := e.ExFuncById[id]

	if !found {
		panic("ExFunc not found")
	}

	exFunc.ParameterIds = parameterIds
}
