package evaluator

import "fmt"

func (e *Evaluator) GroupObjectInstances(results []*PropertyInstanceResult) []*ObjectInstanceResult {
	resultByObjectInstancePath := make(map[string]*ObjectInstanceResult)
	objectInstanceResults := make([]*ObjectInstanceResult, 0)

	for _, result := range results {
		objectInstancePath := result.Path.ParentPath()
		exObject, ok := objectInstancePath.ExObject()
		if !ok {
			continue
		}

		objectInstancePathStr := objectInstancePath.String()

		fmt.Println("Property instance path:\t", result)
		fmt.Println("Object instance path:\t", objectInstancePathStr)

		objectInstanceResult, found := resultByObjectInstancePath[objectInstancePathStr]
		if !found {
			fmt.Println("Not found", len(objectInstanceResults))
			objectInstanceResult = &ObjectInstanceResult{
				ExObject:                exObject,
				PropertyInstanceResults: []*PropertyInstanceResult{},
			}
			objectInstanceResults = append(objectInstanceResults, objectInstanceResult)
			resultByObjectInstancePath[objectInstancePathStr] = objectInstanceResult
		}

		objectInstanceResult.PropertyInstanceResults = append(objectInstanceResult.PropertyInstanceResults, result)
	}

	return objectInstanceResults
}
