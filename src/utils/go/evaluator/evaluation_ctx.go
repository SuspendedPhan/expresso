package evaluator

type EvaluationCtx struct {
	cloneCountResults            []*CloneCountResult
	resultByPropertyInstancePath map[string]*PropertyInstanceResult
}

func (ctx *EvaluationCtx) GetCloneCountResult(cloneCountProperty *Property) *CloneCountResult {
	for _, cloneCountResult := range ctx.cloneCountResults {
		if cloneCountResult.PropertyPath.Property() == cloneCountProperty {
			return cloneCountResult
		}
	}

	panic("CloneCountResult not found")
}

// GetPropertyInstanceResult returns the result of the referenced property given the instance path.
func (ctx *EvaluationCtx) GetPropertyInstanceResult(path *PropertyInstancePath) (*PropertyInstanceResult, bool) {
	pathString := path.String()
	result, found := ctx.resultByPropertyInstancePath[pathString]
	return result, found
}

func (ctx *EvaluationCtx) SetPropertyInstanceResult(path *PropertyInstancePath, result *PropertyInstanceResult) {
	pathString := path.String()
	ctx.resultByPropertyInstancePath[pathString] = result
}
