package evaluator

var logger = NewLogger("evaluator.go")

// -- TYPES --

type Float = float64

type Evaluator struct {
	ValueById map[string]Float
	ExprById  map[string]Expr
}

type Expr struct {
	Id       string
	arg0Id   string
	arg0Type string // "Value" or "Expr"
	arg1Id   string
	arg1Type string
}

func NewEvaluator() *Evaluator {
	return &Evaluator{
		ValueById: map[string]Float{},
		ExprById:  map[string]Expr{},
	}
}

func (e *Evaluator) AddValue(id string, value Float) {
	e.ValueById[id] = value
}

func (e *Evaluator) AddExpr(id string, arg0Id string, arg0Type string, arg1Id string, arg1Type string) {
	e.ExprById[id] = Expr{
		Id:       id,
		arg0Id:   arg0Id,
		arg0Type: arg0Type,
		arg1Id:   arg1Id,
		arg1Type: arg1Type,
	}
}

func (e *Evaluator) EvalExpr(exprId string) Float {
	expr, found := e.ExprById[exprId]
	if !found {
		panic("expr not found")
	}

	arg0 := e.evalArg(expr.arg0Id, expr.arg0Type)
	arg1 := e.evalArg(expr.arg1Id, expr.arg1Type)
	return arg0 + arg1
}

func (e *Evaluator) evalArg(argId string, argType string) Float {
	if argType == "Value" {
		x, found := e.ValueById[argId]
		if !found {
			panic("value not found")
		}
		return x
	}
	if argType == "Expr" {
		return e.EvalExpr(argId)
	}
	panic("unknown argType")
}
