// ex_object.go

package evaluator

import "fmt"

type ExObject struct {
	Id                            string
	ComponentParameterPropertyIds []string
	CloneCountPropertyId          string
	BasicPropertyIds              []string

	ComponentId string // nil if no component

	// ExObjects
	ChildrenIds []string

	Evaluator *Evaluator
}

func (e *Evaluator) ExObjectCreate(id string) {
	e.ExObjectById[id] = &ExObject{
		Id:                            id,
		ComponentParameterPropertyIds: []string{},
		CloneCountPropertyId:          "",
		BasicPropertyIds:              []string{},
		Evaluator:                     e,
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

func (e *Evaluator) ExObjectSetComponent(id string, componentId string) {
	exObject, found := e.ExObjectById[id]

	if !found {
		panic("exObject not found")
	}

	exObject.ComponentId = componentId
}

func (e *Evaluator) ExObjectAddChild(parentId string, childId string) {
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
	return properties
}

func (self *ExObject) Component() *Component {
	if len(self.ComponentParameterPropertyIds) == 0 {
		return nil
	}
	componentId := self.ComponentParameterPropertyIds[0]
	component, exists := self.Evaluator.ComponentById[componentId]
	if !exists {
		panic("Component not found")
	}
	return component
}

func (self *ExObject) Children() []*ExObject {
	var children []*ExObject
	for _, childId := range self.ChildrenIds {
		child, exists := self.Evaluator.ExObjectById[childId]
		if !exists {
			panic("Child not found")
		}
		children = append(children, child)
	}
	return children
}

func (self *ExObject) Name() string {
	return self.Id
}
