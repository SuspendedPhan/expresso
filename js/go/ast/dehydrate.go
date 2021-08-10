package ast

import (
	"fmt"
	"go/ast"
	"reflect"
)

const HydrationTag = "hydration"
const HydrationRefTag = "ref"
const PolymorphRefTag = "polymorph"
const TypeIdFieldName = "TypeId"
const ValueFieldName = "Value"

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

func dehydrate(reflectedHydratedObj reflect.Value) (reflect.Value, error) {
	reflectedHydratedElem := IdempotentElem(reValue(reflectedHydratedObj))

	if reflectedHydratedElem.Kind() == reflect.Struct {
		return dehydrateStruct(reflectedHydratedElem)
	} else {
		return reflectedHydratedElem, nil
	}
}

func dehydrateStruct(reflectedHydratedElem reflect.Value) (reflect.Value, error) {
	dehydratedStruct, err := GetDehydratedStruct(reflectedHydratedElem.Type())
	if err != nil {
		return reflect.Value{}, fmt.Errorf("dehydrate struct | reflectedHydratedElem %v : %v", reflectedHydratedElem.Type().Name(), err)
	}

	reflectedDehydratedPtr := reflect.New(dehydratedStruct)
	for i := 0; i < reflectedHydratedElem.NumField(); i++ {
		dehydratedField := reflectedDehydratedPtr.Elem().Field(i)
		hydratedField := reflectedHydratedElem.Field(i)
		if !dehydratedField.CanSet() {
			fmt.Println("can't set", dehydratedStruct.Field(i).Name)
			continue
		}

		dehydratedStructField := reflectedDehydratedPtr.Elem().Type().Field(i)
		err := dehydrateField(hydratedField, dehydratedField, dehydratedStructField)
		if err != nil {
			return reflect.Value{}, fmt.Errorf("dehydrating field %v: %v", dehydratedStructField.Name, err)
		}
	}
	return reflectedDehydratedPtr.Elem(), nil
}

func dehydrateField(hydratedField reflect.Value, dehydratedField reflect.Value, dehydratedStructField reflect.StructField) error {
	if isHydrationRef(dehydratedStructField) {
		if hydratedField.IsNil() {
			fmt.Println("can't get ID of nil", dehydratedStructField.Name)
		} else {
			method := hydratedField.MethodByName("GetId")
			if !method.IsValid() {
				println(dehydratedStructField.Name)
				println(dehydratedStructField.Type.String())
				println(hydratedField.NumMethod())
				println(hydratedField.Type().String())
				for i := 0; i < hydratedField.NumMethod(); i++ {
					println(hydratedField.Type().Method(i).Name)
				}
				return fmt.Errorf("this field doesn't have a GetId method")
			}
			id := method.Call(make([]reflect.Value, 0))[0]
			dehydratedField.Set(id)
		}
	} else if isHydrationPolymorph(dehydratedStructField) {
		typeId, ok := polymorphRegistry.GetTypeId(hydratedField.Interface())
		if !ok {
			panic("")
		}
		dehydratedField.FieldByName(TypeIdFieldName).Set(reflect.ValueOf(typeId))
		value, err := dehydrate(hydratedField)
		if err != nil {
			return fmt.Errorf("dehydrate polymorph: %v", err)
		}
		dehydratedField.FieldByName(ValueFieldName).Set(value)
	} else {
		value, err := dehydrate(hydratedField)
		if err != nil {
			return fmt.Errorf("dehydrate default case: %v", err)
		}
		dehydratedField.Set(value)
	}
	return nil
}

func GetDehydratedStruct(hydratedElemType reflect.Type) (dehydratedElemType reflect.Type, err error) {
	dehydratedFields := make([]reflect.StructField, 0)
	for i := 0; i < hydratedElemType.NumField(); i++ {
		hydratedStructField := hydratedElemType.Field(i)
		if IsExported(hydratedStructField) {
			dehydratedField, err := GetDehydratedField(hydratedStructField)
			if err != nil {
				return nil, fmt.Errorf("dehydrating struct %v | field %v: %v", hydratedElemType.Name(), hydratedStructField.Name, err)
			}
			dehydratedFields = append(dehydratedFields, dehydratedField)
		}
	}

	return reflect.StructOf(dehydratedFields), nil
}

func GetDehydratedField(hydratedStructField reflect.StructField) (dehydratedField reflect.StructField, err error) {
	if isHydrationRef(hydratedStructField) {
		dehydratedField := hydratedStructField
		dehydratedField.Type = reflect.TypeOf("")
		return dehydratedField, nil
	} else if isHydrationPolymorph(hydratedStructField) {
		polymorphType, err := GetDehydratedPolymorphType()
		if err != nil {
			return reflect.StructField{}, fmt.Errorf("get dehydrated polymorph type: %v", err)
		}
		dehydratedField := reflect.StructField{
			Name: hydratedStructField.Name,
			Type: polymorphType,
			Tag:  hydratedStructField.Tag,
		}
		return dehydratedField, nil
	} else if hydratedStructField.Type.Kind() == reflect.Struct {
		fmt.Println("reflect", hydratedStructField.Type.Name())
		dehydratedStruct, err := GetDehydratedStruct(hydratedStructField.Type)
		if err != nil {
			return reflect.StructField{}, fmt.Errorf("get dehydrated struct field struct: %v", err)
		}
		dehydratedField := hydratedStructField
		dehydratedField.Type = dehydratedStruct
		if dehydratedField.Anonymous {
			dehydratedField.Anonymous = false
			dehydratedField.Name = hydratedStructField.Type.Name()
		}
		return dehydratedField, nil
	} else {
		return hydratedStructField, nil
	}
}

func GetDehydratedPolymorphType() (reflect.Type, error) {
	typeIdField := reflect.StructField{Name: TypeIdFieldName, Type: reflect.TypeOf("")}
	valueField := reflect.StructField{Name: ValueFieldName, Type: reflect.TypeOf((*interface{})(nil)).Elem()}
	polymorphType := reflect.StructOf([]reflect.StructField{typeIdField, valueField})
	return polymorphType, nil
}

func reValue(value reflect.Value) reflect.Value {
	return reflect.ValueOf(value.Interface())
}

func isHydrationRef(field reflect.StructField) bool {
	value, ok := field.Tag.Lookup(HydrationTag)
	return ok && (value == HydrationRefTag)
}

func isHydrationPolymorph(field reflect.StructField) bool {
	value, ok := field.Tag.Lookup(HydrationTag)
	return ok && (value == PolymorphRefTag)
}

func IdempotentTypeElem(t reflect.Type) reflect.Type {
	if t.Kind() == reflect.Ptr {
		return t.Elem()
	} else {
		return t
	}
}

func IdempotentElem(t reflect.Value) reflect.Value {
	if t.Kind() == reflect.Ptr {
		return t.Elem()
	} else {
		return t
	}
}

func IsExported(field reflect.StructField) bool {
	if field.Anonymous {
		return ast.IsExported(field.Type.Name())
	} else {
		return ast.IsExported(field.Name)
	}
}

func reflectedElem(obj interface{}) reflect.Value {
	reflectedObj := reflect.ValueOf(obj)
	if reflectedObj.Kind() == reflect.Ptr {
		reflectedObj = reflectedObj.Elem()
	}
	return reflectedObj
}

func forEachStructField(reflectedObj reflect.Value, f func(field reflect.StructField)) {
	for i := 0; i < reflectedObj.NumField(); i++ {
		f(reflectedObj.Type().Field(i))
	}
}
