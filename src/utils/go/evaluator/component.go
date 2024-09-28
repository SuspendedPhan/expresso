// component.go

package evaluator

type Component struct {
	Id                            string
	ComponentParameterPropertyIds []string
	BasicPropertyIds              []string
	RootObjectIds                 []string
}

func (self *Component) Properties() []*Property {
	panic("Not implemented")
}

func (self *Component) RootObjects() []*ExObject {
	panic("Not implemented")
}

func (e *Evaluator) ComponentCreate(id string) {
	if _, exists := e.ComponentById[id]; exists {
		panic("Component with this ID already exists")
	}

	e.ComponentById[id] = &Component{
		Id:                            id,
		ComponentParameterPropertyIds: []string{},
		BasicPropertyIds:              []string{},
		RootObjectIds:                 []string{},
	}
}

func (e *Evaluator) ComponentAddParameterProperty(componentId string, propertyId string) {
	component, found := e.ComponentById[componentId]
	if !found {
		panic("Component not found")
	}

	component.ComponentParameterPropertyIds = append(component.ComponentParameterPropertyIds, propertyId)
}

func (e *Evaluator) ComponentAddBasicProperty(componentId string, propertyId string) {
	component, found := e.ComponentById[componentId]
	if !found {
		panic("Component not found")
	}

	component.BasicPropertyIds = append(component.BasicPropertyIds, propertyId)
}

func (e *Evaluator) ComponentAddRootObject(componentId string, rootObjectId string) {
	component, found := e.ComponentById[componentId]
	if !found {
		panic("Component not found")
	}

	// Optionally, verify that the rootObjectId exists in ExObjectById
	if _, exists := e.ExObjectById[rootObjectId]; !exists {
		panic("Root Object not found")
	}

	component.RootObjectIds = append(component.RootObjectIds, rootObjectId)
}

func (self *Component) Name() string {
	return self.Id
}
