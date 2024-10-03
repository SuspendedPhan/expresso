package evaluator

import "strings"

type EvaluationResult struct {
	objectInstanceResults []*ObjectInstanceResult
}

func (e *EvaluationResult) GetObjectResultCount() int {
	return len(e.objectInstanceResults)
}

func (e *EvaluationResult) GetPropertyResultCount(objectResultIndex int) int {
	return len(e.objectInstanceResults[objectResultIndex].PropertyInstanceResults)
}

func (e *EvaluationResult) GetPropertyId(objectResultIndex int, propertyResultIndex int) string {
	return e.objectInstanceResults[objectResultIndex].PropertyInstanceResults[propertyResultIndex].Path.Property().Id
}

func (e *EvaluationResult) GetPropertyValue(objectResultIndex int, propertyResultIndex int) float64 {
	return e.objectInstanceResults[objectResultIndex].PropertyInstanceResults[propertyResultIndex].Value
}

func (e *EvaluationResult) String() string {
	// objectInstanceResults join with "\n"

	oiResults := make([]string, len(e.objectInstanceResults))
	for i, oiResult := range e.objectInstanceResults {
		oiResults[i] = oiResult.String()
	}

	return strings.Join(oiResults, "\n")
}
