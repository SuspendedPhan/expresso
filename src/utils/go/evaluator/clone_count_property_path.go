package evaluator

type CloneCountPropertyPath struct {
	// Includes the clone count property itself.
	segments []PathSegment
}

func NewCloneCountPropertyPath1(object *ExObject) *CloneCountPropertyPath {
	return &CloneCountPropertyPath{
		segments: []PathSegment{
			{exItem: object},
			{exItem: object.CloneCountProperty()},
		},
	}
}

func NewCloneCountPropertyPath2(object *ExObject, component *Component, path *CloneCountPropertyPath) *CloneCountPropertyPath {
	newSegments := []PathSegment{
		{exItem: object},
		{exItem: component},
	}
	newSegments = append(newSegments, path.segments...)
	return &CloneCountPropertyPath{segments: newSegments}
}

func NewCloneCountPropertyPath3(object *ExObject, path *CloneCountPropertyPath) *CloneCountPropertyPath {
	newSegments := []PathSegment{
		{exItem: object},
	}
	newSegments = append(newSegments, path.segments...)
	return &CloneCountPropertyPath{segments: newSegments}
}

func (self *CloneCountPropertyPath) String() string {
	// Get self.segments except last segment
	segments := self.segments[:len(self.segments)-1]

	// Convert segments to string
	pathString := pathSegmentsToString(segments)
	return pathString + " > clone-count-property"
}
