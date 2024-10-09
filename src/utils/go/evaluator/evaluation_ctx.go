package evaluator

import "fmt"

type EvaluationCtx struct {
	resultByPropertyInstancePath map[string]*PropertyInstanceResult
	propertyPathByProperty       map[*Property]*PropertyPath
	cloneCountResults            []*CloneCountResult
	evaluator                    *Evaluator
}

// GetPropertyInstanceResult returns the result of the referenced property given the instance path.
func (ctx *EvaluationCtx) GetPropertyInstanceResult(path *PropertyInstancePath) (*PropertyInstanceResult, bool) {
	pathString := path.String()
	result, found := ctx.resultByPropertyInstancePath[pathString]
	return result, found
}

func (ctx *EvaluationCtx) SetPropertyInstanceResult(path *PropertyInstancePath, result *PropertyInstanceResult) {
	pathString := path.String()
	ctx.resultByPropertyInstancePath[pathString] = result
}

func (ctx *EvaluationCtx) GetPropertyPath(property *Property) *PropertyPath {
	path, found := ctx.propertyPathByProperty[property]
	if !found {
		panic("property path not found")
	}
	return path
}

func (ctx *EvaluationCtx) GetCloneNumber(exObject *ExObject, instancePath *PropertyInstancePath) int {
	for _, segment := range instancePath.segments {
		if segment.exItem == exObject {
			return segment.cloneNumber
		}
	}
	panic(fmt.Errorf("clone number not found for exObject %v in instance path %v", exObject, instancePath))
}

func (ctx *EvaluationCtx) GetComponentParameterPropertyInstancePath(componentParameterId string, path *PropertyInstancePath) *PropertyInstancePath {

	// Walk up the path until we hit the right ex-object, then grab the component parameter property.
	// The ex-object is the one that has the component parameter property.

	// println("0::", path.String())

	for i := len(path.segments) - 1; i >= 0; i-- {
		segment := path.segments[i]
		if segment.exItem == nil {
			panic("component parameter not found")
		}

		// println("1::", segment.exItem.Name())

		exObject, ok := segment.exItem.(*ExObject)
		if !ok {
			continue
		}

		// println("2:: ...")

		for _, id := range exObject.ComponentParameterPropertyIds {
			// println("3::", id)
			property := ctx.evaluator.Property(id)

			if property.ComponentParameterId == componentParameterId {
				// println("4::")
				return ctx.NewPropertyInstancePath(path, i, property)
			}
		}
	}

	panic(fmt.Errorf("evaluating component parameter: component parameter not found: %v", componentParameterId))
}

func (ctx *EvaluationCtx) NewPropertyInstancePath(path *PropertyInstancePath, index int, property *Property) *PropertyInstancePath {
	segments := make([]*PropertyInstancePathSegment, 0)

	// Copy until the index, including the index.
	for i := 0; i <= index; i++ {
		segments = append(segments, path.segments[i])
	}

	segments = append(segments, &PropertyInstancePathSegment{
		exItem: property,
	})

	return &PropertyInstancePath{segments: segments}
}
