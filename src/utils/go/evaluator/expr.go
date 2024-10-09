package evaluator

type Expr struct {
	Id            string
	NumberExpr    *NumberExpr
	CallExpr      *CallExpr
	ReferenceExpr *ReferenceExpr
	Evaluator     *Evaluator
}

type NumberExpr struct {
	Value Float
}

type CallExpr struct {
	arg0Id    string
	arg1Id    string
	Evaluator *Evaluator

	exFuncId string
}

type ReferenceExpr struct {
	TargetId   string
	TargetKind string
	Evaluator  *Evaluator
	Expr       *Expr
}

func (e *Expr) String() string {
	return e.Id
}
