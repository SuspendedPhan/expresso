package evaluator

type ExObject struct {
	Id                           string
	ComponentParameterProperties []*Property
	CloneCountProperty           *Property
}

func (e *Evaluator) ExObjectCreate(id string) {
	e.ExObjectById[id] = &ExObject{
		Id:                           id,
		ComponentParameterProperties: []*Property{},
		CloneCountProperty:           nil,
	}
}

func (e *Evaluator) ExObjectAddComponentParameterProperty(exObjectId string, propertyId string) {
	exObject, found := e.ExObjectById[exObjectId]

	if !found {
		panic("exObject not found")
	}

	property, found := e.PropertyById[propertyId]
	if !found {
		panic("property not found")
	}

	exObject.ComponentParameterProperties = append(exObject.ComponentParameterProperties, property)
}

func (e *Evaluator) ExObjectSetCloneCountProperty(id string, cloneCountPropertyId string) {
	exObject, found := e.ExObjectById[id]

	if !found {
		panic("exObject not found")
	}

	cloneCountProperty, found := e.PropertyById[cloneCountPropertyId]
	if !found {
		panic("cloneCountProperty not found")
	}

	exObject.CloneCountProperty = cloneCountProperty
}
