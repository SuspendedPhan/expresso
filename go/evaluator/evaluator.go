package evaluator

import "fmt"

// -- TYPES --

type Float = float64

type Attribute struct {
	evaluator  *Evaluator
	RootExprId string
}

type NumberExpr struct {
	value Float
}

type PrimitiveFunctionCallExpr struct {
	evaluator *Evaluator
	ArgIds    []string
}

type Expr interface {
	eval() Float
}

type Evaluator struct {
	exprById      map[string]Expr
	attributeById map[string]*Attribute

	RootAttributeId string
}

// -- METHODS --

func (a *Attribute) eval() Float {
	fmt.Println("evaluator.go: evaluating attribute: RootExprId", a.RootExprId)
	return a.evaluator.exprById[a.RootExprId].eval()
}

func (n *NumberExpr) eval() Float {
	return n.value
}

func (p *PrimitiveFunctionCallExpr) eval() Float {
	var sum Float
	for _, argId := range p.ArgIds {
		sum += p.evaluator.exprById[argId].eval()
	}
	return sum
}

func NewEvaluator() *Evaluator {
	return &Evaluator{
		exprById:      make(map[string]Expr),
		attributeById: make(map[string]*Attribute),
	}
}

func (e *Evaluator) CreateAttribute(id string) *Attribute {
	fmt.Println("evaluator.go: creating attribute", id)
	attr := &Attribute{evaluator: e}
	e.attributeById[id] = attr
	return attr
}

func (e *Evaluator) CreateNumberExpr(id string, value float64) {
	fmt.Println("creating number expr", id, value)
	e.exprById[id] = &NumberExpr{value: value}
}

func (e *Evaluator) CreatePrimitiveFunctionCallExpr(id string) *PrimitiveFunctionCallExpr {
	fmt.Println("creating primitive function call expr", id)
	expr := &PrimitiveFunctionCallExpr{}
	e.exprById[id] = expr
	return expr
}

func (e *Evaluator) Eval() float64 {
	fmt.Println("evaluator.go: evaluating root attribute", e.RootAttributeId)
	return e.attributeById[e.RootAttributeId].eval()
}

func (e *Evaluator) GetRootAttribute() *Attribute {
	return e.attributeById[e.RootAttributeId]
}
