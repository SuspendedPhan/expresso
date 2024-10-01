package evaluator

import "fmt"

type CloneCountResult struct {
	PropertyPath *CloneCountPropertyPath
	Count        Float
}

func GetCloneCountResult(results []*CloneCountResult, cloneCountProperty *Property) *CloneCountResult {
	if len(results) == 0 {
		panic("results is empty")
	}

	for _, result := range results {
		if result.PropertyPath.Property().Id == cloneCountProperty.Id {
			return result
		}
	}
	panic(fmt.Errorf("CloneCountResult not found for clone count property: %v", cloneCountProperty))
}

func (self *CloneCountResult) String() string {
	return fmt.Sprintf("%s: %s", self.PropertyPath.String(), floatToString(self.Count))
}
