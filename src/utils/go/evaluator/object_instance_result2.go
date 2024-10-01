package evaluator

type PropertyInstanceResult2 struct {
	ComponentParameterPropertyId string
	Value                        Float
}

type ObjectInstanceResult2 struct {
	ExObjectId              string
	PropertyInstanceResults []*PropertyInstanceResult2
}
