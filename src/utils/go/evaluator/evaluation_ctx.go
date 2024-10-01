package evaluator

type EvaluationCtx struct {
	cloneCountResults            []*CloneCountResult
	resultByPropertyInstancePath map[string]*PropertyInstanceResult
	propertyPathByProperty       map[*Property]*PropertyPath
}

func (ctx *EvaluationCtx) GetCloneCountResult(path *CloneCountPropertyPath) *CloneCountResult {
	return GetCloneCountResult(ctx.cloneCountResults, path.Property())
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

func (ctx *EvaluationCtx) GetPropertyPath(property *Property) *PropertyPath {
	path, found := ctx.propertyPathByProperty[property]
	if !found {
		panic("property path not found")
	}
	return path
}
