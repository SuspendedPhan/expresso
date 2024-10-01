package evaluator

import (
	"fmt"
	"strings"
)

type ObjectInstancePath struct {
	segments []*PropertyInstancePathSegment
}

type ObjectInstanceResult struct {
	ExObject                *ExObject
	PropertyInstanceResults []*PropertyInstanceResult
}

func (p *ObjectInstancePath) ExObject() *ExObject {
	exObject, ok := p.segments[len(p.segments)-1].exItem.(*ExObject)
	if !ok {
		fmt.Println(p.segments)
		panic("ObjectInstancePath does not end with an ExObject")
	}
	return exObject
}

func (p *ObjectInstanceResult) String() string {
	// PropertyInstanceResults join with "\n"

	piResults := make([]string, len(p.PropertyInstanceResults))
	for i, piResult := range p.PropertyInstanceResults {
		piResults[i] = piResult.String()
	}

	return strings.Join(piResults, "\n")
}
