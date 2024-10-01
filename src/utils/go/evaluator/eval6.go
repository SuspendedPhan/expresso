// File: eval6.go

package evaluator

func (e *Evaluator) CreateFinalResult(results []*ObjectInstanceResult) []map[string]interface{} {
	finalResults := make([]map[string]interface{}, 0)
	for _, result := range results {
		finalResult := make(map[string]interface{})
		finalResult["exObjectId"] = result.ExObject.Id
		finalResult["propertyInstanceResults"] = make([]map[string]interface{}, 0)
		for _, propertyInstanceResult := range result.PropertyInstanceResults {
			propertyInstanceResultMap := make(map[string]interface{})
			propertyInstanceResultMap["componentParameterPropertyId"] = propertyInstanceResult.Path.Property().Id
			propertyInstanceResultMap["value"] = propertyInstanceResult.Value
			finalResult["propertyInstanceResults"] = append(finalResult["propertyInstanceResults"].([]map[string]interface{}), propertyInstanceResultMap)
		}
		finalResults = append(finalResults, finalResult)
	}
	return finalResults
}
