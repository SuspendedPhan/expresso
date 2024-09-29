// File: eval3.go

package evaluator

// ExpandInstancePaths expands annotated property paths into property instance paths
// by iterating over clone counts and generating all possible instances.
func (e *Evaluator) ExpandInstancePaths(paths []*AnnotatedPropertyPath) []*PropertyInstancePath {
	/*
		yield PropertyInstancePaths = for path in AnnotatedPropertyPaths:
		    segments = PathSegments(path)
		    for instance in ExpandPath(segments):
		        yield instance

		function ExpandPath(PathSegments):
		    FullyExpandedPaths = []
		    PartiallyExpandedPaths = []
		    while PartiallyExpandedPaths is not empty:
		        path = PartiallyExpandedPaths.pop()
		        PartiallyExpandedPaths_ = path.ExpandOnce()
		        for path_ in PartiallyExpandedPaths_:
		            match path_:
		                case FullyExpandedPath:
		                    FullyExpandedPaths.append(path_)
		                case PartiallyExpandedPath:
		                    PartiallyExpandedPaths.append(path_)
		    return FullyExpandedPaths

		function ExpandOnce(path: PartiallyExpandedPath):
		    if path.IsFullyExpanded:
		        return FullyExpandedPath(path)

		    frontSegments, targetSegment, backSegments = path.FirstUnexpandedSegment
		    for i in range(targetSegment.CloneCount):
		        instanceSegment = InstanceSegment(targetSegment, i)
		        path_: PartiallyExpandedPath = Combine(frontSegments, instanceSegment, backSegments)
		        yield path_
	*/
	var instancePaths []*PropertyInstancePath

	for _, annotatedPath := range paths {
		expandedPaths := expandPath(annotatedPath)
		instancePaths = append(instancePaths, expandedPaths...)
	}

	return instancePaths
}

// expandPath takes a single AnnotatedPropertyPath and expands it into multiple
// PropertyInstancePaths based on the clone counts of its segments.
func expandPath(annotatedPath *AnnotatedPropertyPath) []*PropertyInstancePath {
	// Initialize with a single empty path
	paths := []*PropertyInstancePath{{segments: []*PropertyInstancePathSegment{}}}

	for _, segment := range annotatedPath.AnnotatedPathSegments {
		var newPaths []*PropertyInstancePath

		if segment.cloneCount > 1 {
			// If the segment has a clone count greater than 1, create a new path for each clone
			for _, path := range paths {
				for i := 1; i <= int(segment.CloneCount()); i++ {
					newSegment := &PropertyInstancePathSegment{
						exItem:      segment.ExItem,
						cloneNumber: i,
					}

					// Create a new slice of segments with the new segment appended
					newSegments := make([]*PropertyInstancePathSegment, len(path.segments)+1)
					copy(newSegments, path.segments)
					newSegments[len(path.segments)] = newSegment

					newPath := &PropertyInstancePath{
						segments: newSegments,
					}

					newPaths = append(newPaths, newPath)
				}
			}
		} else {
			// If the segment does not have a clone count, append it with cloneNumber set to -1
			for _, path := range paths {
				newSegment := &PropertyInstancePathSegment{
					exItem:      segment.ExItem,
					cloneNumber: -1,
				}

				// Create a new slice of segments with the new segment appended
				newSegments := make([]*PropertyInstancePathSegment, len(path.segments)+1)
				copy(newSegments, path.segments)
				newSegments[len(path.segments)] = newSegment

				newPath := &PropertyInstancePath{
					segments: newSegments,
				}

				newPaths = append(newPaths, newPath)
			}
		}

		// Update the list of paths to the newly expanded paths
		paths = newPaths
	}

	return paths
}
