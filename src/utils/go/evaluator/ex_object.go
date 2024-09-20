package evaluator

type ExObject struct {
	Id                            string
	ComponentParameterPropertyIds []string
	CloneCountPropertyId          string
	BasicPropertyIds              []string
}

func (e *Evaluator) ExObjectCreate(id string) {
	e.ExObjectById[id] = &ExObject{
		Id:                            id,
		ComponentParameterPropertyIds: []string{},
		CloneCountPropertyId:          "",
		BasicPropertyIds:              []string{},
	}
}

func (e *Evaluator) ExObjectAddComponentParameterProperty(exObjectId string, propertyId string) {
	exObject, found := e.ExObjectById[exObjectId]

	if !found {
		panic("exObject not found")
	}

	exObject.ComponentParameterPropertyIds = append(exObject.ComponentParameterPropertyIds, propertyId)
}

func (e *Evaluator) ExObjectSetCloneCountProperty(id string, cloneCountPropertyId string) {
	exObject, found := e.ExObjectById[id]

	if !found {
		panic("exObject not found")
	}

	exObject.CloneCountPropertyId = cloneCountPropertyId
}

func (e *Evaluator) ExObjectAddBasicProperty(id string, propertyId string) {
	exObject, found := e.ExObjectById[id]

	if !found {
		panic("exObject not found")
	}

	exObject.BasicPropertyIds = append(exObject.BasicPropertyIds, propertyId)
}
