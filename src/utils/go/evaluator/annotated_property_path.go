// File: annotated_property_path.go

package evaluator

import (
	"fmt"
	"strconv"
	"strings"
)

type AnnotatedPropertyPath struct {
	AnnotatedPathSegments []*AnnotatedPathSegment
}

type AnnotatedPathSegment struct {
	ExItem     ExItem
	cloneCount Float // -1 if not an ex-object
}

func (self AnnotatedPathSegment) IsExObject() bool {
	return self.cloneCount != -1
}

func (self AnnotatedPathSegment) CloneCount() Float {
	if !self.IsExObject() {
		panic("Not an ex-object segment")
	}
	return self.cloneCount
}

func (self *AnnotatedPropertyPath) String() string {
	var pathParts []string
	var lastPart string

	segmentCount := len(self.AnnotatedPathSegments)
	for i, segment := range self.AnnotatedPathSegments {
		switch segment.ExItem.(type) {
		case *Property:
			if i == segmentCount-1 {
				lastPart = segment.String()
			} else {
				pathParts = append(pathParts, segment.String())
			}
		default:
			pathParts = append(pathParts, segment.String())
		}
	}

	pathStr := strings.Join(pathParts, " / ")
	if lastPart != "" {
		if pathStr != "" {
			return fmt.Sprintf("%s > %s", pathStr, lastPart)
		}
		return lastPart
	}
	return pathStr
}

func (self AnnotatedPathSegment) String() string {
	var part string
	switch item := self.ExItem.(type) {
	case *ExObject:
		if self.IsExObject() {
			part = fmt.Sprintf("object|%s: (%s)", item.Name(), floatToString(self.CloneCount()))
		} else {
			part = fmt.Sprintf("object|%s", item.Name())
		}
	case *Component:
		part = fmt.Sprintf("component|%s", item.Name())
	case *Property:
		part = fmt.Sprintf("property|%s", item.Name())
	default:
		panic("Unknown ExItem type")
	}
	return part
}

func floatToString(f float64) string {
	if f == float64(int64(f)) {
		// No fractional part, convert to integer string
		return strconv.FormatInt(int64(f), 10)
	}
	// Has a fractional part, keep decimal places
	return strconv.FormatFloat(f, 'f', -1, 64)
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
