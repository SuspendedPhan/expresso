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
	argIds    []string
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
	for _, argId := range p.argIds {
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

func (e *Evaluator) CreatePrimitiveFunctionCallExpr(id string, argIds []string) {
	fmt.Println("creating primitive function call expr", id, argIds)
	e.exprById[id] = &PrimitiveFunctionCallExpr{argIds: argIds}
}

func (e *Evaluator) Eval() float64 {
	fmt.Println("evaluator.go: evaluating root attribute", e.RootAttributeId)
	return e.attributeById[e.RootAttributeId].eval()
}

func (e *Evaluator) GetRootAttribute() *Attribute {
	return e.attributeById[e.RootAttributeId]
}
