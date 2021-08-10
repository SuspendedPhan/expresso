package ast

import "reflect"

type PolymorphRegistry struct {
	typeByTypeId map[string]reflect.Type
	typeIdByType map[reflect.Type]string
}

func (r PolymorphRegistry) GetType(typeId string) (t reflect.Type, ok bool) {
	t, ok = r.typeByTypeId[typeId]
	return
}

func (r PolymorphRegistry) GetTypeId(obj interface{}) (id string, ok bool) {
	t := IdempotentTypeElem(reflect.TypeOf(obj))
	id, ok = r.typeIdByType[t]
	return
}

func (r PolymorphRegistry) Register(obj interface{}, id string) {
	t := IdempotentTypeElem(reflect.TypeOf(obj))
	r.typeIdByType[t] = id
	r.typeByTypeId[id] = t
}

var polymorphRegistry = NewPolymorphRegistry()

func NewPolymorphRegistry() PolymorphRegistry {
	polymorphRegistry := PolymorphRegistry{}
	polymorphRegistry.typeByTypeId = make(map[string]reflect.Type)
	polymorphRegistry.typeIdByType = make(map[reflect.Type]string)
	polymorphRegistry.Register(NumberNode{}, "f6261e46-ca56-4bfa-93ad-a14a3e1b3f05")
	return polymorphRegistry
}
