package evaluator

import "fmt"

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
	panic(fmt.Errorf("CloneCountResult not found for clone count property: %v", cloneCountProperty))
}

func (self *CloneCountResult) String() string {
	return fmt.Sprintf("%s: %s", self.PropertyPath.String(), floatToString(self.Count))
}
