// eval1_extract_property_paths.go

package evaluator

// Extracts property paths from the object hierarchy.
func (e *Evaluator) ExtractPropertyPaths(rootExObjects []*ExObject) ([]*CloneCountPropertyPath, []*PropertyPath) {
	/*
		for object in objects:
		    yield* ExtractPropertyPaths_(object)
	*/

	cloneCountPropertyPaths := make([]*CloneCountPropertyPath, 0)
	propertyPaths := make([]*PropertyPath, 0)

	for _, object := range rootExObjects {
		paths := e.ExtractNonCloneCountPropertyPaths_(object)
		propertyPaths = append(propertyPaths, paths...)

		cloneCountPaths := ExtractCloneCountPropertyPaths(object)
		cloneCountPropertyPaths = append(cloneCountPropertyPaths, cloneCountPaths...)
	}

	return cloneCountPropertyPaths, propertyPaths
}

func (e *Evaluator) ExtractNonCloneCountPropertyPaths_(object *ExObject) []*PropertyPath {
	/*
		function ExtractNonCloneCountPropertyPaths_(Object):
		    for property in Object.properties:
		        yield NonCloneCountPropertyPath(Object, property)
		    if let component = Object.Component:
		        for property in component.properties:
		            yield NonCloneCountPropertyPath(Object, component, property)
		        for rootObject in component.RootObjects:
		            for path in ExtractNonCloneCountPropertyPaths_(rootObject):
		                yield NonCloneCountPropertyPath(Object, component, path)

		    for child in Object.Children:
		        for path in ExtractNonCloneCountPropertyPaths_(child):
		            yield NonCloneCountPropertyPath(Object, path)
	*/

	paths := make([]*PropertyPath, 0)

	for _, property := range object.Properties() {
		path := NewPropertyPath1(object, property)
		paths = append(paths, path)
	}

	if object.Component() != nil {
		component := object.Component()
		for _, property := range component.Properties() {
			path := NewPropertyPath2(object, component, property)
			paths = append(paths, path)
		}

		for _, rootObject := range component.RootObjects() {
			for _, path := range e.ExtractNonCloneCountPropertyPaths_(rootObject) {
				path := NewPropertyPath3(object, component, path)
				paths = append(paths, path)
			}
		}

		for _, child := range object.Children() {
			for _, path := range e.ExtractNonCloneCountPropertyPaths_(child) {
				path := NewPropertyPath4(object, path)
				paths = append(paths, path)
			}
		}
	}

	return paths
}

func ExtractCloneCountPropertyPaths(object *ExObject) []*CloneCountPropertyPath {
	/*
		function ExtractCloneCountPropertyPaths_(Object):
			yield CloneCountPropertyPath(Object)
			if let component = Object.Component:
				for rootObject in component.RootObjects:
					for path in ExtractCloneCountPropertyPaths_(rootObject):
						yield CloneCountPropertyPath(Object, component, path)

			for child in Object.Children:
				for path in ExtractCloneCountPropertyPaths_(child):
					yield CloneCountPropertyPath(Object, path)
	*/

	paths := make([]*CloneCountPropertyPath, 0)

	path := NewCloneCountPropertyPath1(object)
	paths = append(paths, path)

	if object.Component() != nil {
		component := object.Component()
		for _, rootObject := range component.RootObjects() {
			for _, path := range ExtractCloneCountPropertyPaths(rootObject) {
				path := NewCloneCountPropertyPath2(object, component, path)
				paths = append(paths, path)
			}
		}
	}

	for _, child := range object.Children() {
		for _, path := range ExtractCloneCountPropertyPaths(child) {
			path := NewCloneCountPropertyPath3(object, path)
			paths = append(paths, path)
		}
	}

	return paths
}
