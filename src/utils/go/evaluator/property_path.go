// property_path.go

package evaluator

import (
	"fmt"
	"strings"
)

type PropertyPathSegment struct {
	exItem ExItem
}

type PropertyPath struct {
	segments []*PropertyPathSegment
}

func NewPropertyPath1(object *ExObject, property *Property) *PropertyPath {
	return &PropertyPath{
		segments: []*PropertyPathSegment{
			{exItem: object},
			{exItem: property},
		},
	}
}

func NewPropertyPath2(object *ExObject, component *Component, property *Property) *PropertyPath {
	return &PropertyPath{
		segments: []*PropertyPathSegment{
			{exItem: object},
			{exItem: component},
			{exItem: property},
		},
	}
}

func NewPropertyPath3(object *ExObject, component *Component, path *PropertyPath) *PropertyPath {
	newSegments := []*PropertyPathSegment{
		{exItem: object},
		{exItem: component},
	}
	newSegments = append(newSegments, path.segments...)
	return &PropertyPath{segments: newSegments}
}

func NewPropertyPath4(object *ExObject, path *PropertyPath) *PropertyPath {
	newSegments := []*PropertyPathSegment{
		{exItem: object},
	}
	newSegments = append(newSegments, path.segments...)
	return &PropertyPath{segments: newSegments}
}

func (self *PropertyPath) String() string {
	return pathSegmentsToString(self.segments)
}

func pathSegmentsToString(segments []*PropertyPathSegment) string {
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

func (p *PropertyPath) Property() *Property {
	lastSegment := p.segments[len(p.segments)-1]
	property, ok := lastSegment.exItem.(*Property)
	if !ok {
		panic("last segment is not a property")
	}
	return property
}

func (p *PropertyPathSegment) IsExObject() bool {
	_, ok := p.exItem.(*ExObject)
	return ok
}
