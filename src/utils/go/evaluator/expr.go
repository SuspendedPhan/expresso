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

type ReferenceExpr struct {
	TargetId   string
	TargetKind string
	Evaluator  *Evaluator
	Expr       *Expr
}

func (e *Expr) String() string {
	return e.Id
}
