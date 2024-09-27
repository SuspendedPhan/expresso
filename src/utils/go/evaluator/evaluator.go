package evaluator

// -- TYPES --

type Float = float64

var logger Logger2

type Evaluator struct {
	RootExObjectIds []string
	ExObjectById    map[string]*ExObject
	PropertyById    map[string]*Property
	ExprById        map[string]*Expr
}

type Expr struct {
	Id            string
	NumberExpr    *NumberExpr
	CallExpr      *CallExpr
	ReferenceExpr *ReferenceExpr
}

type NumberExpr struct {
	Value Float
}

type CallExpr struct {
	arg0Id string
	arg1Id string
}

type ReferenceExpr struct {
	TargetId   string
	TargetKind string
}

func NewEvaluator(logger_ Logger2) *Evaluator {
	logger = logger_
	return &Evaluator{
		RootExObjectIds: []string{},
		ExObjectById:    map[string]*ExObject{},
		PropertyById:    map[string]*Property{},
		ExprById:        map[string]*Expr{},
	}
}

func (e *Evaluator) AddRootExObject(exObjectId string) {
	logger.Log("AddRootExObject", exObjectId)
	e.RootExObjectIds = append(e.RootExObjectIds, exObjectId)
}

func (e *Evaluator) EvalExpr(ctx *EvaluationCtx, exprId string) Float {
	expr, found := e.ExprById[exprId]
	if !found {
		panic("expr not found " + exprId)
	}

	if expr.NumberExpr != nil {
		return expr.NumberExpr.Value
	}

	if expr.CallExpr != nil {
		arg0 := e.EvalExpr(ctx, expr.CallExpr.arg0Id)
		arg1 := e.EvalExpr(ctx, expr.CallExpr.arg1Id)
		return arg0 + arg1
	}

	if expr.ReferenceExpr != nil {
		targetId := expr.ReferenceExpr.TargetId
		targetKind := expr.ReferenceExpr.TargetKind
		if targetKind == "Property/BasicProperty" {
			property := e.PropertyById[targetId]
			return e.EvalExpr(ctx, property.ExprId)
		}
		// todp CNT
		panic("evaluating reference expr: unexpected targetKind " + targetKind)
	}

	panic("expr is neither a number expr nor a call expr")
}
