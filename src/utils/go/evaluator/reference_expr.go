package evaluator

func (e *Evaluator) ReferenceExprCreate(id string) {
	e.ExprById[id] = &Expr{
		Id: id,
		ReferenceExpr: &ReferenceExpr{
			TargetId:   "uninitialized",
			TargetKind: "uninitialized",
		},
	}
}

func (e *Evaluator) ReferenceExprSetTargetId(id string, targetId string) {
	expr, found := e.ExprById[id]
	if !found {
		panic("expr not found")
	}
	refExpr := expr.ReferenceExpr
	if refExpr == nil {
		panic("expr is not a reference expr")
	}

	refExpr.TargetId = targetId
}

// targetKind can be
// - Property/ComponentParameterProperty
// - Property/BasicProperty
// - Property/CloneCountProperty
// - ComponentParameter/Custom
// - ExFuncParameter
func (e *Evaluator) ReferenceExprSetTargetKind(id string, targetKind string) {
	expr, found := e.ExprById[id]
	if !found {
		panic("expr not found " + id)
	}
	refExpr := expr.ReferenceExpr
	if refExpr == nil {
		panic("expr is not a reference expr")
	}

	refExpr.TargetKind = targetKind
}
