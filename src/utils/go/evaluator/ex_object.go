package evaluator

type ExObject struct {
	Id                 string
	PropertyById       map[string]*Property
	CloneCountProperty *Property
}

func (e *Evaluator) ExObjectCreate(id string) {
	e.ExObjectById[id] = &ExObject{
		Id:           id,
		PropertyById: map[string]*Property{},
	}
}

func (e *Evaluator) ExObjectSetCloneCount(id string, cloneCountPropertyId string) {
	exObject, found := e.ExObjectById[id]

	if !found {
		panic("exObject not found")
	}

	cloneCountProperty, found := exObject.PropertyById[cloneCountPropertyId]
	if !found {
		panic("cloneCountProperty not found")
	}

	exObject.CloneCountProperty = cloneCountProperty
}

func (e *Evaluator) ExObjectAddProperty(exObjectId string, propertyId string) {
	exObject, found := e.ExObjectById[exObjectId]

	if !found {
		panic("exObject not found")
	}

	exObject.PropertyById[propertyId] = &Property{
		Id: propertyId,
	}
}
