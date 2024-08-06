package evaluator

type ExObject struct {
	Id           string
	CloneCount   int
	PropertyById map[string]*Property
}

func (e *Evaluator) ExObjectCreate(id string) {
	e.ExObjectById[id] = &ExObject{
		Id:           id,
		PropertyById: map[string]*Property{},
	}
}

func (e *Evaluator) ExObjectSetCloneCount(id string, cloneCount int) {
	exObject, found := e.ExObjectById[id]

	if !found {
		panic("exObject not found")
	}

	exObject.CloneCount = cloneCount
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
