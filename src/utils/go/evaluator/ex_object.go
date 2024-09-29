// ex_object.go

package evaluator

import "fmt"

type ExObject struct {
	Id                            string
	ComponentParameterPropertyIds []string
	CloneCountPropertyId          string
	BasicPropertyIds              []string

	ComponentId string // "" if no component

	// ExObjects
	ChildrenIds []string

	Evaluator *Evaluator
}

func (e *Evaluator) ExObjectCreate(id string) {
	logger.Log3(8, "ExObjectCreate", "id", id)
	e.ExObjectById[id] = &ExObject{
		Id:                            id,
		ComponentParameterPropertyIds: []string{},
		CloneCountPropertyId:          "",
		BasicPropertyIds:              []string{},
		Evaluator:                     e,
	}
}

func (e *Evaluator) ExObjectAddComponentParameterProperty(exObjectId string, propertyId string) {
	logger.Log3(8, "ExObjectAddComponentParameterProperty", "exObjectId", exObjectId, "propertyId", propertyId)
	exObject, found := e.ExObjectById[exObjectId]

	if !found {
		panic("exObject not found")
	}

	exObject.ComponentParameterPropertyIds = append(exObject.ComponentParameterPropertyIds, propertyId)
}

func (e *Evaluator) ExObjectSetCloneCountProperty(id string, cloneCountPropertyId string) {
	logger.Log3(8, "ExObjectSetCloneCountProperty", "id", id, "cloneCountPropertyId", cloneCountPropertyId)
	exObject, found := e.ExObjectById[id]

	if !found {
		panic("exObject not found")
	}

	exObject.CloneCountPropertyId = cloneCountPropertyId
}

func (e *Evaluator) ExObjectAddBasicProperty(id string, propertyId string) {
	logger.Log3(8, "ExObjectAddBasicProperty", "id", id, "propertyId", propertyId)
	exObject, found := e.ExObjectById[id]

	if !found {
		panic("exObject not found")
	}

	exObject.BasicPropertyIds = append(exObject.BasicPropertyIds, propertyId)
}

func (e *Evaluator) ExObjectSetComponent(id string, componentId string) {
	logger.Log3(8, "ExObjectSetComponent", "id", id, "componentId", componentId)
	exObject, found := e.ExObjectById[id]

	if !found {
		panic("exObject not found")
	}

	exObject.ComponentId = componentId
}

func (e *Evaluator) ExObjectAddChild(parentId string, childId string) {
	logger.Log3(8, "ExObjectAddChild", "parentId", parentId, "childId", childId)
	parent, found := e.ExObjectById[parentId]
	if !found {
		panic(fmt.Sprintf("Parent ExObject with ID '%s' not found", parentId))
	}

	_, found = e.ExObjectById[childId]
	if !found {
		panic(fmt.Sprintf("Child ExObject with ID '%s' not found", childId))
	}

	for _, existingChildId := range parent.ChildrenIds {
		if existingChildId == childId {
			panic(fmt.Sprintf("Child with ID '%s' is already a child of parent '%s'", childId, parentId))
		}
	}

	parent.ChildrenIds = append(parent.ChildrenIds, childId)
}

// NonCloneCountProperties returns all properties associated with the ExObject
// excluding the CloneCountProperty.
func (self *ExObject) NonCloneCountProperties() []*Property {
	logger.Log3(8, "NonCloneCountProperties", "self", self)
	var properties []*Property

	// Helper function to add properties if they are not the CloneCountProperty
	addProperty := func(propertyIds []string) {
		for _, id := range propertyIds {
			if prop, exists := self.Evaluator.PropertyById[id]; exists {
				properties = append(properties, prop)
			} else {
				panic("Property not found")
			}
		}
	}

	addProperty(self.ComponentParameterPropertyIds)
	addProperty(self.BasicPropertyIds)
	logger.Log3(8, "NonCloneCountProperties end", "return", properties)
	return properties
}

func (self *ExObject) Component() *Component {
	logger.Log3(8, "Component", "self", self)
	if self.ComponentId == "" {
		logger.Log3(8, "Component end", "return", nil)
		return nil
	}

	component, exists := self.Evaluator.ComponentById[self.ComponentId]
	if !exists {
		panic("Component not found")
	}
	logger.Log3(8, "Component end", "return", component)
	return component
}

func (self *ExObject) Children() []*ExObject {
	logger.Log3(8, "Children", "self", self)
	var children []*ExObject
	for _, childId := range self.ChildrenIds {
		child, exists := self.Evaluator.ExObjectById[childId]
		if !exists {
			panic("Child not found")
		}
		children = append(children, child)
	}
	logger.Log3(8, "Children end", "return", children)
	return children
}

func (self *ExObject) Name() string {
	logger.Log3(8, "Name", "self", self)
	name := self.Id
	logger.Log3(8, "Name end", "return", name)
	return name
}

func (self *ExObject) CloneCountProperty() *Property {
	logger.Log3(8, "CloneCountProperty", "self", self)
	if self.CloneCountPropertyId == "" {
		panic("CloneCountProperty not set")
	}

	prop, exists := self.Evaluator.PropertyById[self.CloneCountPropertyId]
	if !exists {
		panic("CloneCountProperty not found")
	}
	logger.Log3(8, "CloneCountProperty end", "return", prop)
	return prop
}
