// File: property_instance_path.go

package evaluator

type PropertyInstancePathSegment struct {
	exItem      *ExItem
	cloneNumber int // -1 if not an ex-object
}

type PropertyInstancePath struct {
	segments []*PropertyInstancePathSegment
}
