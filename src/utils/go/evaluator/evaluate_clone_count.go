package evaluator

func (e *Evaluator) evaluateCloneCount(path *CloneCountPropertyPath) Float {
	// Get last segment
	lastSegment := path.segments[len(path.segments)-1]

	// Get the clone count property
	property, ok := lastSegment.exItem.(*Property)
	if !ok {
		panic("Last segment is not a property")
	}

	expr := property.Expr().NumberExpr
	if expr == nil {
		panic("CloneCountProperty expression is not a NumberExpr")
	}

	return expr.Value
}
