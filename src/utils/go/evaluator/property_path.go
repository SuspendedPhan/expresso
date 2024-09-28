// property_path.go

package evaluator

import (
	"fmt"
	"strings"
)

type PathSegment struct {
	exItem ExItem
}

type PropertyPath struct {
	segments []PathSegment
}

func NewPropertyPath1(object *ExObject, property *Property) *PropertyPath {
	return &PropertyPath{
		segments: []PathSegment{
			{exItem: object},
			{exItem: property},
		},
	}
}

func NewPropertyPath2(object *ExObject, component *Component, property *Property) *PropertyPath {
	return &PropertyPath{
		segments: []PathSegment{
			{exItem: object},
			{exItem: component},
			{exItem: property},
		},
	}
}

func NewPropertyPath3(object *ExObject, component *Component, path *PropertyPath) *PropertyPath {
	newSegments := []PathSegment{
		{exItem: object},
		{exItem: component},
	}
	newSegments = append(newSegments, path.segments...)
	return &PropertyPath{segments: newSegments}
}

func NewPropertyPath4(object *ExObject, path *PropertyPath) *PropertyPath {
	newSegments := []PathSegment{
		{exItem: object},
	}
	newSegments = append(newSegments, path.segments...)
	return &PropertyPath{segments: newSegments}
}

func (self PropertyPath) String() string {
	return pathSegmentsToString(self.segments)
}

func pathSegmentsToString(segments []PathSegment) string {
	var pathParts []string
	var lastPart string

	segmentCount := len(segments)
	for i, segment := range segments {
		switch item := segment.exItem.(type) {
		case *ExObject:
			pathParts = append(pathParts, fmt.Sprintf("object|%s", item.Name()))
		case *Component:
			pathParts = append(pathParts, fmt.Sprintf("component|%s", item.Name()))
		case *Property:
			if i == segmentCount-1 {
				lastPart = fmt.Sprintf("property|%s", item.Name())
			} else {
				pathParts = append(pathParts, fmt.Sprintf("property|%s", item.Name()))
			}
		default:
			panic("Unknown ExItem type")
		}
	}

	pathStr := strings.Join(pathParts, " / ")
	if lastPart != "" {
		if pathStr != "" {
			return fmt.Sprintf("%s > %s", pathStr, lastPart)
		} else {
			return lastPart
		}
	} else {
		return pathStr
	}
}
