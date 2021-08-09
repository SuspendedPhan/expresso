package ast

import (
	"fmt"
	"go/ast"
	"reflect"
)

const HydrationTag = "hydration"
const HydrationRefTag = "ref"
const PolymorphRefTag = "polymorph"

func dehydrate(reflectedHydratedObj reflect.Value) reflect.Value {
	reflectedHydratedElem := IdempotentElem(reflectedHydratedObj)

	if reflectedHydratedElem.Kind() == reflect.Struct {
		return dehydrateStruct(reflectedHydratedElem)
	} else {
		return reflectedHydratedElem
	}
}

func dehydrateStruct(reflectedHydratedElem reflect.Value) reflect.Value {
	dehydratedStruct := GetDehydratedStruct(reflectedHydratedElem.Type())
	reflectedDehydratedPtr := reflect.New(dehydratedStruct)
	for i := 0; i < reflectedHydratedElem.NumField(); i++ {
		dehydratedField := reflectedDehydratedPtr.Elem().Field(i)
		hydratedField := reflectedHydratedElem.Field(i)
		if !dehydratedField.CanSet() {
			fmt.Println("can't set", dehydratedStruct.Field(i).Name)
			continue
		}

		dehydratedStructField := reflectedDehydratedPtr.Elem().Type().Field(i)
		if isHydrationRef(dehydratedStructField) {
			if hydratedField.IsNil() {
				fmt.Println("can't get ID of nil", dehydratedStruct.Field(i).Name)
			} else {
				id := hydratedField.MethodByName("GetId").Call(make([]reflect.Value, 0))[0]
				dehydratedField.Set(id)
			}
		} else {
			dehydratedField.Set(dehydrate(hydratedField))
		}
	}
	return reflectedDehydratedPtr.Elem()
}

func GetDehydratedStruct(hydratedElemType reflect.Type) (dehydratedElemType reflect.Type) {
	dehydratedFields := make([]reflect.StructField, 0)
	for i := 0; i < hydratedElemType.NumField(); i++ {
		hydratedField := hydratedElemType.Field(i)
		if IsExported(hydratedField) {
			dehydratedField := GetDehydratedField(hydratedField)
			dehydratedFields = append(dehydratedFields, dehydratedField)
		}
	}

	return reflect.StructOf(dehydratedFields)
}

func GetDehydratedField(hydratedField reflect.StructField) (dehydratedField reflect.StructField) {
	if isHydrationRef(hydratedField) {
		dehydratedField := hydratedField
		dehydratedField.Type = reflect.TypeOf("")
		return dehydratedField
	} else if isHydrationPolymorph(hydratedField) {
		dehydratedField := reflect.StructField{
			Name: hydratedField.Name,
			Type: GetDehydratedPolymorphType(hydratedField.Type),
		}
		return dehydratedField
	} else if hydratedField.Type.Kind() == reflect.Struct {
		fmt.Println("reflect", hydratedField.Type.Name())
		dehydratedStruct := GetDehydratedStruct(IdempotentTypeElem(hydratedField.Type))
		dehydratedField := hydratedField
		dehydratedField.Type = dehydratedStruct
		if dehydratedField.Anonymous {
			dehydratedField.Anonymous = false
			dehydratedField.Name = hydratedField.Type.Name()
		}
		return dehydratedField
	} else {
		return hydratedField
	}
}

func GetDehydratedPolymorphType(hydratedType reflect.Type) reflect.Type {
	hydratedElemType := IdempotentTypeElem(hydratedType)
	if hydratedElemType.Kind() == reflect.Struct {
		typeIdField := reflect.StructField{Name: "typeId", Type: reflect.TypeOf("")}
		valueField := reflect.StructField{Name: "value", Type: GetDehydratedStruct(hydratedElemType)}
		polymorphType := reflect.StructOf([]reflect.StructField{typeIdField, valueField})
		return polymorphType
	} else {
		//for i := 0; i < hydratedElemType.NumField(); i++ {
		//	spew.Dump(hydratedElemType.Field(i))
		//}
		//spew.Dump(hydratedElemType)
		panic(hydratedElemType.Kind())
	}
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
