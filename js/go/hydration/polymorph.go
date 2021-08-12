package hydration

import "reflect"

type Polymorph struct {
	TypeId         string
	ValueContainer ValueContainer
}

type ValueContainer struct {
	Value interface{}
}

func (p ValueContainer) UnmarshalJSON(bytes []byte) error {
	println("whatat")
	return nil
}

func isHydrationPolymorph(field reflect.StructField) bool {
	value, ok := field.Tag.Lookup(HydrationTag)
	return ok && (value == PolymorphRefTag)
}
