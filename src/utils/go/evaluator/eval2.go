// File: eval2.go

package evaluator

// Annotates property paths with clone counts.
func (e *Evaluator) AnnotateCloneCounts(cloneCountPropertyPaths []*CloneCountPropertyPath, propertyPaths []*PropertyPath) (cloneCountResults []*CloneCountResult, annotatedPropertyPaths []*AnnotatedPropertyPath) {
	/*
	   CloneCountResults =
	       for path in CloneCountPropertyPaths:
	           count = EvaluateCloneCount(path)
	           yield CloneCountResult(path, count)

	   yield AnnotatedPropertyPaths =
	       for path in NonCloneCountPropertyPaths:
	           annotatedSegments =
	               for segment in path:
	                   yield AnnotatedSegment(segment, CloneCountResults)
	           yield AnnotatedPropertyPath(annotatedSegments)
	*/

	cloneCountResults_ := make([]*CloneCountResult, 0, len(cloneCountPropertyPaths))
	for _, path := range cloneCountPropertyPaths {
		count := e.evaluateCloneCount(path)
		cloneCountResults_ = append(cloneCountResults_, &CloneCountResult{PropertyPath: path, Count: count})
	}

	annotatedPropertyPaths_ := make([]*AnnotatedPropertyPath, 0, len(propertyPaths))
	for _, path := range propertyPaths {
		annotatedSegments := make([]*AnnotatedPathSegment, 0, len(path.segments))
		for _, segment := range path.segments {
			annotatedSegments = append(annotatedSegments, NewAnnotatedPathSegment(segment, cloneCountResults_))
		}
		annotatedPropertyPaths_ = append(annotatedPropertyPaths_, NewAnnotatedPropertyPath(annotatedSegments))
	}

	return cloneCountResults_, annotatedPropertyPaths_
}
