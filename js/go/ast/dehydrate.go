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

type FieldDehydration struct {
	hydratedFieldIndex   int
	dehydratedFieldIndex int
	dehydration          Dehydration
}

type Dehydration struct {
	fields         []FieldDehydration // only present if dehydratedType is a struct
	hydratedType   reflect.Type
	dehydratedType reflect.Type
}

func DehydrateType(hydratedType reflect.Type) (Dehydration, error) {
	hydratedElemType := IdempotentTypeElem(hydratedType)

	if hydratedElemType.Kind() == reflect.Struct {
		dehydration := Dehydration{
			fields:       make([]FieldDehydration, 0),
			hydratedType: hydratedElemType,
		}
		dehydratedFields := make([]reflect.StructField, 0)
		for i := 0; i < hydratedElemType.NumField(); i++ {
			hydratedField := hydratedElemType.Field(i)
			fieldDehydration, err := DehydrateFieldType(hydratedField)
			if err != nil {
				return Dehydration{}, fmt.Errorf("dehydrating struct %v | field %v: %v", hydratedElemType.Name(), hydratedField.Name, err)
			}
			dehydration.fields = append(dehydration.fields, FieldDehydration{
				hydratedFieldIndex:   i,
				dehydratedFieldIndex: len(dehydration.fields),
				dehydration:          fieldDehydration,
			})

			dehydratedField := hydratedField
			dehydratedField.Type = fieldDehydration.dehydratedType
			if dehydratedField.Anonymous {
				dehydratedField.Anonymous = false
				dehydratedField.Name = hydratedField.Type.Name()
			}
			dehydratedFields = append(dehydratedFields, dehydratedField)
		}
		dehydration.dehydratedType = reflect.StructOf(dehydratedFields)
		return dehydration, nil
	} else {
		return Dehydration{
			fields:         nil,
			hydratedType:   hydratedElemType,
			dehydratedType: hydratedElemType,
		}, nil
	}
}

func DehydrateFieldType(hydratedField reflect.StructField) (Dehydration, error) {
	if isHydrationRef(hydratedField) {
		return Dehydration{
			fields:         nil,
			hydratedType:   hydratedField.Type,
			dehydratedType: reflect.TypeOf(""),
		}, nil
	} else if isHydrationPolymorph(hydratedField) {
		polymorphType, err := GetDehydratedPolymorphType()
		if err != nil {
			return Dehydration{}, fmt.Errorf("get dehydrated polymorph type: %v", err)
		}
		return Dehydration{
			fields:         nil,
			hydratedType:   hydratedField.Type,
			dehydratedType: polymorphType,
		}, nil
	} else {
		fmt.Println("reflect", hydratedField.Type.Name())
		fieldDehydration, err := DehydrateType(hydratedField.Type)
		if err != nil {
			return Dehydration{}, fmt.Errorf("get dehydrated struct field struct: %v", err)
		}
		return fieldDehydration, nil
	}
}

func dehydrate(reflectedHydratedObj reflect.Value) (reflect.Value, error) {
	reflectedHydratedElem := IdempotentElem(reValue(reflectedHydratedObj))

	if reflectedHydratedElem.Kind() == reflect.Struct {
		return dehydrateStruct(reflectedHydratedElem)
	} else {
		return reflectedHydratedElem, nil
	}
}

func dehydrateStruct(hydratedElem reflect.Value) (reflect.Value, error) {
	dehydratedStructType, err := DehydrateType(hydratedElem.Type())
	if err != nil {
		return reflect.Value{}, fmt.Errorf("dehydrate struct | hydratedElem %v : %v", hydratedElem.Type().Name(), err)
	}
	return dehydrateStruct0(hydratedElem, dehydratedStructType)
}

func dehydrateStruct0(hydratedStruct reflect.Value, dehydration Dehydration) (reflect.Value, error) {
	hydratedElemStruct := IdempotentElem(hydratedStruct)
	dehydratedStruct := reflect.New(dehydration.dehydratedType)

	for _, field := range dehydration.fields {
		hydratedStructField := dehydration.hydratedType.Field(field.hydratedFieldIndex)
		dehydratedStructField := dehydration.dehydratedType.Field(field.dehydratedFieldIndex)
		dehydratedField := dehydratedStruct.Elem().Field(field.dehydratedFieldIndex)
		hydratedField := hydratedElemStruct.Field(field.hydratedFieldIndex)

		if isHydrationRef(hydratedStructField) {
			if hydratedField.IsNil() {
				fmt.Println("can't get ID of nil", dehydratedStructField.Name)
			} else {
				method := hydratedField.MethodByName("GetId")
				if !method.IsValid() {
					return reflect.Value{}, fmt.Errorf("this field doesn't have a GetId method")
				}
				id := method.Call(make([]reflect.Value, 0))[0]
				dehydratedField.Set(id)
			}
		} else if isHydrationPolymorph(hydratedStructField) {
			typeId, ok := polymorphRegistry.GetTypeId(hydratedField.Interface())
			if !ok {
				return reflect.Value{}, fmt.Errorf("dehydrate polymorph: %v", hydratedField.Type().String())
			}
			dehydratedField.FieldByName(TypeIdFieldName).Set(reflect.ValueOf(typeId))
			value, err := dehydrate(hydratedField)
			if err != nil {
				return reflect.Value{}, fmt.Errorf("dehydrate polymorph: %v", err)
			}
			dehydratedField.FieldByName(ValueFieldName).Set(value)
		} else if dehydratedStructField.Type.Kind() == reflect.Struct {
			value, err := dehydrateStruct0(hydratedField, field.dehydration)
			if err != nil {
				return reflect.Value{}, fmt.Errorf("recurse dehydrate struct: %v", err)
			}
			dehydratedField.Set(value)
		} else {
			dehydratedField.Set(hydratedField)
		}
	}
	return dehydratedStruct, nil
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
