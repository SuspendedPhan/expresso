package hydration

import (
	"reflect"
)

type PolymorphRegistryStruct struct {
	typeByTypeId map[string]reflect.Type
	typeIdByType map[reflect.Type]string
}

func (r PolymorphRegistryStruct) GetType(typeId string) (t reflect.Type, ok bool) {
	t, ok = r.typeByTypeId[typeId]
	return
}

func (r PolymorphRegistryStruct) GetTypeId(obj interface{}) (id string, ok bool) {
	t := IdempotentTypeElem(reflect.TypeOf(obj))
	id, ok = r.typeIdByType[t]
	return
}

func (r PolymorphRegistryStruct) Register(obj interface{}, id string) {
	t := IdempotentTypeElem(reflect.TypeOf(obj))
	r.typeIdByType[t] = id
	r.typeByTypeId[id] = t
}

var PolymorphRegistry = NewPolymorphRegistry()

func NewPolymorphRegistry() PolymorphRegistryStruct {
	polymorphRegistry := PolymorphRegistryStruct{}
	polymorphRegistry.typeByTypeId = make(map[string]reflect.Type)
	polymorphRegistry.typeIdByType = make(map[reflect.Type]string)
	return polymorphRegistry
}
