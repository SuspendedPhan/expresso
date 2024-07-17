package evaluator

func SceneInstancePathAppend(basePath string, componentId string, cloneId string) string {
	if basePath == "" {
		return componentId + ":" + cloneId
	} else {
		return basePath + "-" + componentId + ":" + cloneId
	}
}

func CreateAttributeSceneInstancePath(attributeId string, sceneInstancePath string) string {
	return attributeId + "|" + sceneInstancePath
}
