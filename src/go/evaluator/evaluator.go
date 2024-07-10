package evaluator

var logger = NewLogger("evaluator.go")

// -- TYPES --

type Float = float64

type Evaluator struct {
	ExprById map[string]interface{}
}

type NumberExpr struct {
	Id    string
	Value Float
}

type CallExpr struct {
	Id       string
	arg0Id   string
	arg0Type string // "Value" or "Expr"
	arg1Id   string
	arg1Type string
}

func NewEvaluator() *Evaluator {
	return &Evaluator{
		ExprById: map[string]interface{}{},
	}
}

func (e *Evaluator) AddNumberExpr(id string) {
	e.ExprById[id] = NumberExpr{Id: id}
}

func (e *Evaluator) SetNumberExprValue(id string, value Float) {
	expr, found := e.ExprById[id].(NumberExpr)
	if !found {
		panic("expr not found")
	}
	expr.Value = value
}

func (e *Evaluator) AddCallExpr(id string) {
	e.ExprById[id] = &CallExpr{
		Id:       id,
		arg0Id:   "null",
		arg0Type: "null",
		arg1Id:   "null",
		arg1Type: "null",
	}
}

func (e *Evaluator) SetCallExprArg0(id string, argId string, argType string) {
	expr, found := e.ExprById[id].(*CallExpr)
	if !found {
		panic("expr not found")
	}
	expr.arg0Id = argId
	expr.arg0Type = argType
}

func (e *Evaluator) SetCallExprArg1(id string, argId string, argType string) {
	expr, found := e.ExprById[id].(*CallExpr)
	if !found {
		panic("expr not found")
	}
	expr.arg1Id = argId
	expr.arg1Type = argType
}

func (e *Evaluator) EvalExpr(exprId string) Float {
	expr, found := e.ExprById[exprId]
	if !found {
		panic("expr not found")
	}

	switch expr := expr.(type) {
	case NumberExpr:
		return expr.Value
	case *CallExpr:
		arg0 := e.EvalExpr(expr.arg0Id)
		arg1 := e.EvalExpr(expr.arg1Id)
		return arg0 + arg1
	default:
		panic("unknown expr type")
	}
}
