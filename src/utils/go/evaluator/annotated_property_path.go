package evaluator

type AnnotatedPropertyPath struct {
	AnnotatedPathSegments []*AnnotatedPathSegment
}

type AnnotatedPathSegment struct {
	ExItem     ExItem
	cloneCount Float // -1 if not an ex-object
}

func (self AnnotatedPathSegment) IsCloneCountProperty() bool {
	return self.cloneCount != -1
}

func (self AnnotatedPathSegment) CloneCount() Float {
	if !self.IsCloneCountProperty() {
		panic("Not a clone count property")
	}
	return self.cloneCount
}

func (self AnnotatedPropertyPath) String() string {
	// TODO
	panic("Not implemented")
}

func NewAnnotatedPropertyPath(annotatedSegments []*AnnotatedPathSegment) *AnnotatedPropertyPath {
	return &AnnotatedPropertyPath{AnnotatedPathSegments: annotatedSegments}
}

func NewAnnotatedPathSegment(segment *PathSegment, cloneCountResults []*CloneCountResult) *AnnotatedPathSegment {
	if _, ok := segment.exItem.(*ExObject); !ok {
		return &AnnotatedPathSegment{ExItem: segment.exItem, cloneCount: -1}
	}

	// Find the clone count result for the segment
	cloneCount := Float(-1)
	for _, result := range cloneCountResults {
		segments := result.PropertyPath.segments
		for _, segment_ := range segments {
			if segment_.exItem == segment.exItem {
				cloneCount = result.Count
				break
			}
		}
	}

	if cloneCount == -1 {
		panic("Clone count result not found")
	}

	return &AnnotatedPathSegment{ExItem: segment.exItem, cloneCount: cloneCount}
}
