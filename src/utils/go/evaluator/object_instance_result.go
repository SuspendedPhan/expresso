package evaluator

import (
	"strings"
)

type ObjectInstancePath struct {
	segments []*PropertyInstancePathSegment
}

type ObjectInstanceResult struct {
	ExObject                *ExObject
	PropertyInstanceResults []*PropertyInstanceResult
}

func (p *ObjectInstancePath) ExObject() (*ExObject, bool) {
	exObject, ok := p.segments[len(p.segments)-1].exItem.(*ExObject)
	return exObject, ok
}

func (p *ObjectInstanceResult) String() string {
	// PropertyInstanceResults join with "\n"

	piResults := make([]string, len(p.PropertyInstanceResults))
	for i, piResult := range p.PropertyInstanceResults {
		piResults[i] = piResult.String()
	}

	return strings.Join(piResults, "\n")
}
