package evaluator

type AnnotatedPropertyPath struct {
	AnnotatedPathSegments []*AnnotatedPathSegment
}

type AnnotatedPathSegment struct {
	ExItem     ExItem
	cloneCount int // -1 if not an ex-object
}

func (self AnnotatedPathSegment) IsCloneCountProperty() bool {
	return self.cloneCount != -1
}

func (self AnnotatedPathSegment) CloneCount() int {
	if !self.IsCloneCountProperty() {
		panic("Not a clone count property")
	}
	return self.cloneCount
}
