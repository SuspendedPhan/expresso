package evaluator

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

type Evaler interface {
	eval() Float
}

type Evaluator struct {
	exprById      map[string]Evaler
	attributeById map[string]*Attribute

	rootAttributeId string
}

// -- METHODS --

func (a *Attribute) eval() Float {
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
		exprById:      make(map[string]Evaler),
		attributeById: make(map[string]*Attribute),
	}
}

func (e *Evaluator) CreateAttribute(id string, rootExprId string) *Attribute {
	attr := &Attribute{evaluator: e, RootExprId: rootExprId}
	e.attributeById[id] = attr
	return attr
}

func (e *Evaluator) CreateNumberExpr(id string, value float64) {
	e.exprById[id] = &NumberExpr{value: value}
}

func (e *Evaluator) CreatePrimitiveFunctionCallExpr(id string, argIds []string) {
	e.exprById[id] = &PrimitiveFunctionCallExpr{argIds: argIds}
}

func (e *Evaluator) Eval() float64 {
	return e.attributeById[e.rootAttributeId].eval()
}
