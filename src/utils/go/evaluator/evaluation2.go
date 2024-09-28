package evaluator

type PathSegment struct {
}

type PropertyPath struct {
	segments []PathSegment
}

// Extracts property paths from the object hierarchy.
func (e *Evaluator) ExtractPropertyPaths(rootExObjects []ExObject) {
	/*
		for object in objects:
		    yield* ExtractPropertyPaths_(object)
	*/

	propertyPaths := make([]PropertyPath, 0)

	for _, object := range rootExObjects {
		paths := e.ExtractPropertyPaths_(object)
		propertyPaths = append(propertyPaths, paths...)
	}
}

func (e *Evaluator) ExtractPropertyPaths_(object ExObject) []PropertyPath {
	/*
		function ExtractPropertyPaths_(Object):
		    for property in Object.properties:
		        yield NewPropertyPath1(Object, property)
		    if let component = Object.Component:
		        for property in component.properties:
		            yield NewPropertyPath2(Object, component, property)
		        for rootObject in component.RootObjects:
		            for path in ExtractPropertyPaths_(rootObject):
		                yield NewPropertyPath3(Object, component, path)
	*/

	paths := make([]PropertyPath, 0)
	for _, property := range object.Properties() {
		path := NewPropertyPath1(object, property)
		paths = append(paths, path)
	}

	if object.Component() != nil {
		component := object.Component()
		for _, property := range component.Properties() {
			path := NewPropertyPath2(object, *component, property)
			paths = append(paths, path)
		}

		for _, rootObject := range component.RootObjects() {
			for _, path := range e.ExtractPropertyPaths_(rootObject) {
				path := NewPropertyPath3(object, *component, path)
				paths = append(paths, path)
			}
		}
	}
}

func NewPropertyPath1(object ExObject, property Property) PropertyPath {

}

func NewPropertyPath2(object ExObject, component Component, property Property) PropertyPath {

}

func NewPropertyPath3(object ExObject, component Component, path PropertyPath) PropertyPath {

}
