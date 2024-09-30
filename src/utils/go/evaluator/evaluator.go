package evaluator

// -- TYPES --

type Float = float64

var logger Logger2

type Evaluator struct {
	RootExObjectIds []string
	ComponentById   map[string]*Component
	ExObjectById    map[string]*ExObject
	PropertyById    map[string]*Property
	ExprById        map[string]*Expr
}

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
	arg0Id string
	arg1Id string
}

type ReferenceExpr struct {
	TargetId   string
	TargetKind string
	Evaluator  *Evaluator
	Expr       *Expr
}

func NewEvaluator(logger_ Logger2) *Evaluator {
	logger = logger_
	return &Evaluator{
		RootExObjectIds: []string{},
		ComponentById:   map[string]*Component{},
		ExObjectById:    map[string]*ExObject{},
		PropertyById:    map[string]*Property{},
		ExprById:        map[string]*Expr{},
	}
}

func (e *Evaluator) AddRootExObject(exObjectId string) {
	logger.Log("AddRootExObject", exObjectId)
	e.RootExObjectIds = append(e.RootExObjectIds, exObjectId)
}

func (e *Evaluator) RootExObjects() []*ExObject {
	objects := []*ExObject{}
	for _, exObjectId := range e.RootExObjectIds {
		objects = append(objects, e.ExObjectById[exObjectId])
	}
	return objects
}
