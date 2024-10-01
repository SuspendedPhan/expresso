package evaluator

func (e *Evaluator) GroupObjectInstances(results []*PropertyInstanceResult) []*ObjectInstanceResult {
	resultByObjectInstancePath := make(map[string]*ObjectInstanceResult)

	for _, result := range results {
		objectInstancePath := result.Path.ParentPath()
		objectInstancePathStr := objectInstancePath.String()
		objectInstanceResult := resultByObjectInstancePath[objectInstancePathStr]
		if objectInstanceResult == nil {
			objectInstanceResult = &ObjectInstanceResult{
				ExObject:                objectInstancePath.ExObject(),
				PropertyInstanceResults: []*PropertyInstanceResult{},
			}
			resultByObjectInstancePath[objectInstancePathStr] = objectInstanceResult
		}

		objectInstanceResult.PropertyInstanceResults = append(objectInstanceResult.PropertyInstanceResults, result)
	}

	objectInstanceResults := make([]*ObjectInstanceResult, 0, len(resultByObjectInstancePath))
	for _, objectInstanceResult := range resultByObjectInstancePath {
		objectInstanceResults = append(objectInstanceResults, objectInstanceResult)
	}

	return objectInstanceResults
}
