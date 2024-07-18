package evaluator

type Component struct {
	Id            string
	CloneCount    int
	AttributeById map[string]*Attribute
}

func (e *Evaluator) ComponentCreate(id string) {
	e.RootComponentById[id] = &Component{
		Id:            id,
		AttributeById: map[string]*Attribute{},
	}
}

func (e *Evaluator) ComponentSetCloneCount(id string, cloneCount int) {
	component, found := e.RootComponentById[id]

	if !found {
		panic("component not found")
	}

	component.CloneCount = cloneCount
}

func (e *Evaluator) ComponentAddAttribute(componentId string, attributeId string) {
	component, found := e.RootComponentById[componentId]

	if !found {
		panic("component not found")
	}

	component.AttributeById[attributeId] = &Attribute{
		Id: attributeId,
	}
}
