package evaluator

type CloneCountResult struct {
	PropertyPath *CloneCountPropertyPath
	Count        Float
}

func GetCloneCountResult(results []*CloneCountResult, cloneCountProperty *Property) *CloneCountResult {
	for _, result := range results {
		if result.PropertyPath.Property() == cloneCountProperty {
			return result
		}
	}
	panic("CloneCountResult not found")
}
