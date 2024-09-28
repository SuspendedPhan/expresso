package evaluator

type CloneCountPropertyPath struct {
	// Doesn't include the clone count property itself.
	segments []PathSegment
}

func NewCloneCountPropertyPath1(object *ExObject) *CloneCountPropertyPath {
	return &CloneCountPropertyPath{
		segments: []PathSegment{
			{exItem: object},
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
	return pathSegmentsToString(self.segments) + " > clone-count-property"
}
