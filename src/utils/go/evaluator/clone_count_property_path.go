package evaluator

type CloneCountPropertyPath struct {
	// Includes the clone count property itself.
	segments []*PropertyPathSegment
}

func NewCloneCountPropertyPath1(object *ExObject) *CloneCountPropertyPath {
	return &CloneCountPropertyPath{
		segments: []*PropertyPathSegment{
			{exItem: object},
			{exItem: object.CloneCountProperty()},
		},
	}
}

func NewCloneCountPropertyPath2(object *ExObject, component *Component, path *CloneCountPropertyPath) *CloneCountPropertyPath {
	newSegments := []*PropertyPathSegment{
		{exItem: object},
		{exItem: component},
	}
	newSegments = append(newSegments, path.segments...)
	return &CloneCountPropertyPath{segments: newSegments}
}

func NewCloneCountPropertyPath3(object *ExObject, path *CloneCountPropertyPath) *CloneCountPropertyPath {
	newSegments := []*PropertyPathSegment{
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

func (r *CloneCountPropertyPath) Property() *Property {
	// Get last segment
	segment := r.segments[len(r.segments)-1]
	property, ok := segment.exItem.(*Property)
	if !ok {
		panic("last segment is not a property")
	}

	return property
}
