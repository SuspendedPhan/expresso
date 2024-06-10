package evaluator

import "fmt"

var logger = NewLogger("evaluator.go")

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
	logger.Log("Attribute.eval", a.RootExprId)
	return a.evaluator.exprById[a.RootExprId].eval()
}

func (n *NumberExpr) eval() Float {
	logger.Log("NumberExpr.eval", n.value)
	return n.value
}

func (p *PrimitiveFunctionCallExpr) eval() Float {
	logger.Log("PrimitiveFunctionCallExpr.eval", p.ArgIds)
	var sum Float
	for _, argId := range p.ArgIds {
		ev := p.evaluator
		exprById := ev.exprById
		expr := exprById[argId]
		if expr == nil {
			fmt.Println("evaluator.go: expr not found", argId)
		}
		sum += expr.eval()
	}
	return sum
}

func NewEvaluator() *Evaluator {
	logger.Log("NewEvaluator")
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
	logger.Log("Evaluator.CreateNumberExpr", id, value)
	e.exprById[id] = &NumberExpr{value: value}
}

func (e *Evaluator) CreatePrimitiveFunctionCallExpr(id string) *PrimitiveFunctionCallExpr {
	logger.Log("Evaluator.CreatePrimitiveFunctionCallExpr", id)
	expr := &PrimitiveFunctionCallExpr{evaluator: e}
	e.exprById[id] = expr
	return expr
}

func (e *Evaluator) Eval() float64 {
	logger.Log("Evaluator.Eval", e.RootAttributeId)
	return e.attributeById[e.RootAttributeId].eval()
}

func (e *Evaluator) GetRootAttribute() *Attribute {
	logger.Log("Evaluator.GetRootAttribute", e.RootAttributeId)
	return e.attributeById[e.RootAttributeId]
}

func (e *Evaluator) Debug() {
	for id, expr := range e.exprById {
		fmt.Println("  expr:", id, expr)

		switch expr := expr.(type) {
		case *NumberExpr:
			fmt.Println("    number expr:", expr.value)
		case *PrimitiveFunctionCallExpr:
			fmt.Println("    primitive function call expr:", expr.ArgIds)
		default:
			fmt.Println("    unknown expr type")
		}
	}

	for id, attr := range e.attributeById {
		fmt.Println("  attr:", id, attr)
		fmt.Println("    root expr id:", attr.RootExprId)
	}

	fmt.Println("  root attribute id:", e.RootAttributeId)
}
