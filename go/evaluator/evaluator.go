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
	Value Float
}

type Evaluator struct {
	// components []*Component
	NumberExpr *NumberExpr
}

type Result struct {
	Value Float
}

func (e *Evaluator) Eval() Result {
	return Result{e.NumberExpr.Value * e.NumberExpr.Value}
}

func (n *NumberExpr) Eval() Float {
	return n.Value
}
