package evaluator

type CloneCountResult struct {
	PropertyPath *CloneCountPropertyPath
	Count        Float
}

// Annotates property paths with clone counts.
func (e *Evaluator) AnnotateCloneCounts(cloneCountPropertyPaths []*CloneCountPropertyPath, propertyPaths []*PropertyPath) []*AnnotatedPropertyPath {
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

	cloneCountResults := make([]*CloneCountResult, 0, len(cloneCountPropertyPaths))
	for _, path := range cloneCountPropertyPaths {
		count := e.evaluateCloneCount(path)
		cloneCountResults = append(cloneCountResults, &CloneCountResult{PropertyPath: path, Count: count})
	}

	annotatedPropertyPaths := make([]*AnnotatedPropertyPath, 0, len(propertyPaths))
	for _, path := range propertyPaths {
		annotatedSegments := make([]*AnnotatedPathSegment, 0, len(path.segments))
		for _, segment := range path.segments {
			annotatedSegments = append(annotatedSegments, NewAnnotatedPathSegment(segment, cloneCountResults))
		}
		annotatedPropertyPaths = append(annotatedPropertyPaths, NewAnnotatedPropertyPath(annotatedSegments))
	}

	return annotatedPropertyPaths
}
