// File: property_instance_path.go

package evaluator

import (
	"fmt"
	"strings"
)

type PropertyInstancePathSegment struct {
	exItem      ExItem
	cloneNumber int // -1 if not an ex-object
}

type PropertyInstancePath struct {
	segments []*PropertyInstancePathSegment
}

// String method for PropertyInstancePath
func (p *PropertyInstancePath) String() string {
	var pathParts []string
	var lastPart string

	segmentCount := len(p.segments)
	for i, segment := range p.segments {
		switch segment.exItem.(type) {
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
			return fmt.Sprintf("PropertyInstancePath: (%s > %s)", pathStr, lastPart)
		}
		return fmt.Sprintf("PropertyInstancePath: (%s)", lastPart)
	}
	return fmt.Sprintf("PropertyInstancePath: (%s)", pathStr)
}

// String method for PropertyInstancePathSegment
func (s *PropertyInstancePathSegment) String() string {
	var part string
	switch item := s.exItem.(type) {
	case *ExObject:
		if s.IsExObject() {
			part = fmt.Sprintf("object|%s: (%d)", item.Name(), s.cloneNumber)
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

// Helper method to check if the segment is an ExObject with a valid clone number
func (s *PropertyInstancePathSegment) IsExObject() bool {
	return s.cloneNumber != -1
}
