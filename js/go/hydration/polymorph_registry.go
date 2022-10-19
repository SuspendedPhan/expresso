package hydration

import (
	"expressioni.sta/common"
	"reflect"
)

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

func (r PolymorphRegistry) NewPolymorph(hydratedValue interface{}, dehydratedValue interface{}) (_ Polymorph, err error) {
	hnd := common.NewHandler(&err, "NewPolymorph")
	defer hnd.Handle()

	id, ok := r.GetTypeId(hydratedValue)
	hnd.Assert(ok, "couldn't find type id", reflect.TypeOf(dehydratedValue).String())

	return Polymorph{
		TypeId: id,
		Value:  dehydratedValue,
	}, nil
}

var PolymorphRegistryInstance = NewPolymorphRegistry()

func NewPolymorphRegistry() PolymorphRegistry {
	polymorphRegistry := PolymorphRegistry{}
	polymorphRegistry.typeByTypeId = make(map[string]reflect.Type)
	polymorphRegistry.typeIdByType = make(map[reflect.Type]string)
	return polymorphRegistry
}
