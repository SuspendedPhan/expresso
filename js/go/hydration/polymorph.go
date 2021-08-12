package hydration

import (
	"encoding/json"
	"expressionista/common"
	"reflect"
)

type Polymorph struct {
	TypeId string
	Value  interface{}
}

type SemiUnmarshaledPolymorph struct {
	TypeId string
	Value  json.RawMessage
}

func (p *Polymorph) UnmarshalJSON(bytes []byte) (err error) {
	handler := common.NewHandler(&err, "UnmarshalJSON")
	defer handler.Handle()

	semiUnmarshaled := &SemiUnmarshaledPolymorph{}
	err = json.Unmarshal(bytes, semiUnmarshaled)
	handler.AssertNilErr(err)

	p.TypeId = semiUnmarshaled.TypeId

	valueType, ok := PolymorphRegistry.GetType(semiUnmarshaled.TypeId)
	handler.Assert(ok, "type assert")

	p.Value = reflect.New(valueType).Elem().Interface()
	err = json.Unmarshal(semiUnmarshaled.Value, &p.Value)
	handler.AssertNilErr(err)

	return nil
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
