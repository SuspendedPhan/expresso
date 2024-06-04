package evaluator

type Float = float64

type Component struct {
	attributes *Attribute
}

type Attribute struct {
	rootExpr *Expr
}

type Expr interface {
	Eval() Float
}

type PrimitiveFunctionCallExpr struct {
	functionId string
	argExprs   []*Expr
}

type AttributeReferenceExpr struct {
	attribute *Attribute
}

type NumberExpr struct {
	value Float
}

type Evaluator struct {
	// components []*Component
	Value Float
}

type Result struct {
	Value Float
}

func (e *Evaluator) Eval() Result {
	return Result{e.Value + 1}
}
