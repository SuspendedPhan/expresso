package main

import "reflect"

type TypeRegistry struct {
	typeByName map[string]reflect.Type
}

func (r TypeRegistry) register(reflectType reflect.Type) {
	r.typeByName[reflectType.Name()] = reflectType
}

func NewTypeRegistry() TypeRegistry {
	return TypeRegistry{typeByName: make(map[string]reflect.Type)}
}

func (r TypeRegistry) construct(typeName string) interface{} {
	return reflect.New(r.typeByName[typeName]).Interface()
}
