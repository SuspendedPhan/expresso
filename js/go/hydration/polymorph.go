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

	valueType, ok := PolymorphRegistryInstance.GetType(semiUnmarshaled.TypeId)
	handler.Assert(ok, "type assert")

	p.Value = reflect.New(valueType).Elem().Interface()
	err = json.Unmarshal(semiUnmarshaled.Value, &p.Value)
	handler.AssertNilErr(err)

	return nil
}

func (p *Polymorph) Type(registry PolymorphRegistry) (_ reflect.Type, err error) {
	handler := common.NewHandler(&err, "couldn't find type in registry", p.TypeId)
	defer handler.Handle()

	t, ok := registry.GetType(p.TypeId)
	handler.Assert(ok)
	return t, nil
}
