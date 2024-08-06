package evaluator

func CanvasObjectPathAppend(basePath string, componentId string, cloneId string) string {
	if basePath == "" {
		return componentId + ":" + cloneId
	} else {
		return basePath + "-" + componentId + ":" + cloneId
	}
}

func CreateCanvasPropertyPath(propertyId string, canvasObjectPath string) string {
	return canvasObjectPath + "|" + propertyId
}

func CreateCloneCountCanvasPropertyPath(parentCanvasObjectPath string, exObjectId string, cloneCountPropertyId string) string {
	return parentCanvasObjectPath + "|" + exObjectId + "|" + cloneCountPropertyId
}
