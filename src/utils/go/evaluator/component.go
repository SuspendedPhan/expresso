// component.go

package evaluator

type Component struct {
	Id                    string
	ComponentParameterIds []string
	BasicPropertyIds      []string
	RootObjectIds         []string
	Evaluator             *Evaluator
}

// Properties retrieves all properties associated with the component.
func (c *Component) Properties() []*Property {
	properties := []*Property{}

	// Retrieve Basic Properties
	for _, propId := range c.BasicPropertyIds {
		prop, exists := c.Evaluator.PropertyById[propId]
		if !exists {
			panic("Property not found: " + propId)
		}
		properties = append(properties, prop)
	}

	return properties
}

// RootObjects retrieves all root objects associated with the component.
func (c *Component) RootObjects() []*ExObject {
	rootObjects := []*ExObject{}

	for _, objId := range c.RootObjectIds {
		obj, exists := c.Evaluator.ExObjectById[objId]
		if !exists {
			panic("ExObject not found: " + objId)
		}
		rootObjects = append(rootObjects, obj)
	}

	return rootObjects
}

func (e *Evaluator) ComponentCreate(id string) {
	if _, exists := e.ComponentById[id]; exists {
		panic("Component with this ID already exists")
	}

	e.ComponentById[id] = &Component{
		Id:                    id,
		ComponentParameterIds: []string{},
		BasicPropertyIds:      []string{},
		RootObjectIds:         []string{},
		Evaluator:             e,
	}
}

func (e *Evaluator) ComponentAddParameter(componentId string, parameterId string) {
	component, found := e.ComponentById[componentId]
	if !found {
		panic("Component not found")
	}

	component.ComponentParameterIds = append(component.ComponentParameterIds, parameterId)
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
