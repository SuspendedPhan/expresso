package evaluator

type Float = float64

type Component struct {
	attributes *Attribute
}

type Attribute struct {
	rootExpr Expr
}

type Expr interface {
	Eval() Float
}

type PrimitiveFunctionCallExpr struct {
	FunctionId string
	Args       []Expr
}

type AttributeReferenceExpr struct {
	attribute *Attribute
}

type NumberExpr struct {
	Value Float
}

type Evaluator struct {
	// components []*Component
	Expr Expr
}

type Result struct {
	Value Float
}

func (e *Evaluator) Eval() Result {
	return Result{e.Expr.Eval()}
}

func (n *NumberExpr) Eval() Float {
	return n.Value
}

func (p *PrimitiveFunctionCallExpr) Eval() Float {
	sum := 0.0
	for _, arg := range p.Args {
		sum += arg.Eval()
	}
	return sum
}
