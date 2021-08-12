package hydration

import (
	"expressionista/common"
	"fmt"
	"go/ast"
	"reflect"
)

const HydrationTag = "hydration"
const HydrationRefTag = "ref"
const PolymorphRefTag = "polymorph"
const TypeIdFieldName = "TypeId"
const ValueFieldName = "Value"
const ValueContainerFieldName = "ValueContainer"

type FieldDehydration struct {
	hydratedFieldIndex   int
	dehydratedFieldIndex int
	dehydration          Dehydration
}

type Dehydration struct {
	fields         []FieldDehydration // only present if DehydratedType is a struct
	hydratedType   reflect.Type
	DehydratedType reflect.Type
}

func DehydrateType(hydratedType reflect.Type) (dehydration Dehydration, err error) {
	defer common.AddErrorInfo(&err, fmt.Sprintf("DehydrateType %v", hydratedType.Name()))()

	hydratedElemType := IdempotentTypeElem(hydratedType)

	if hydratedElemType.Kind() == reflect.Struct {
		return DehydrateStructType(hydratedElemType)
	} else {
		return Dehydration{
			fields:         nil,
			hydratedType:   hydratedElemType,
			DehydratedType: hydratedElemType,
		}, nil
	}
}

func DehydrateStructType(hydratedElemType reflect.Type) (_ Dehydration, err error) {
	defer common.AddErrorInfo(&err, fmt.Sprintf("DehydrateTypeStructType %v", hydratedElemType.String()))()
	dehydration := Dehydration{
		fields:       make([]FieldDehydration, 0),
		hydratedType: hydratedElemType,
	}
	dehydratedFields := make([]reflect.StructField, 0)
	for i := 0; i < hydratedElemType.NumField(); i++ {
		hydratedField := hydratedElemType.Field(i)
		fieldDehydration, skip, err := DehydrateFieldType(hydratedField)
		if skip {
			DebugLogf("Skipped field %v", hydratedField.Name)
			continue
		}
		if err != nil {
			return Dehydration{}, err
		}
		dehydration.fields = append(dehydration.fields, FieldDehydration{
			hydratedFieldIndex:   i,
			dehydratedFieldIndex: len(dehydration.fields),
			dehydration:          fieldDehydration,
		})

		dehydratedField := hydratedField
		dehydratedField.Type = fieldDehydration.DehydratedType
		if dehydratedField.Anonymous {
			dehydratedField.Anonymous = false
			dehydratedField.Name = hydratedField.Type.Name()
		}
		dehydratedFields = append(dehydratedFields, dehydratedField)
	}
	dehydration.DehydratedType = reflect.StructOf(dehydratedFields)
	return dehydration, nil
}

func DehydrateFieldType(hydratedField reflect.StructField) (_ Dehydration, skip bool, err error) {
	defer common.AddErrorInfo(&err, fmt.Sprintf("DehydrateFieldType %v %v", hydratedField.Name, hydratedField.Type.String()))()

	if !ast.IsExported(hydratedField.Name) || hydratedField.Type.Kind() == reflect.Chan {
		return Dehydration{}, true, nil
	} else if isHydrationRef(hydratedField) {
		return Dehydration{
			fields:         nil,
			hydratedType:   hydratedField.Type,
			DehydratedType: reflect.TypeOf(""),
		}, false, nil
	} else if isHydrationPolymorph(hydratedField) {
		polymorphType := reflect.TypeOf(Polymorph{})
		return Dehydration{
			fields:         nil,
			hydratedType:   hydratedField.Type,
			DehydratedType: polymorphType,
		}, false, nil
	} else {
		fieldDehydration, err := DehydrateType(hydratedField.Type)
		return fieldDehydration, false, err
	}
}

func Dehydrate(reflectedHydratedObj reflect.Value) (reflect.Value, error) {
	defer func() {
		DebugLog("")
		DebugLogf("=== done dehydrating object %v ===", reflectedHydratedObj.Type().String())
		DebugLog("")
	}()

	reflectedHydratedElem := IdempotentElem(reValue(reflectedHydratedObj))

	DebugLog(fmt.Sprintf("dehydrate %v", reflectedHydratedElem.Type().Name()))

	if reflectedHydratedElem.Kind() == reflect.Struct {
		return dehydrateStruct(reflectedHydratedElem)
	} else {
		return reflectedHydratedElem, nil
	}
}

func dehydrateStruct(hydratedElem reflect.Value) (dehydratedStruct reflect.Value, err error) {
	defer common.AddErrorInfo(&err, fmt.Sprintf("dehydrate struct | hydratedElem %v", hydratedElem.Type().Name()))()

	dehydratedStructType, err := DehydrateType(hydratedElem.Type())
	if err != nil {
		return reflect.Value{}, err
	}
	DebugLog("")
	DebugLog(fmt.Sprintf("=== done dehydrating type %v ===", hydratedElem.Type().String()))
	DebugLog("")
	struct0, err := dehydrateStruct0(hydratedElem, dehydratedStructType)
	return struct0, err
}

func dehydrateStruct0(hydratedStruct reflect.Value, dehydration Dehydration) (dehydratedStruct reflect.Value, err error) {
	defer common.AddErrorInfo(&err, fmt.Sprintf("dehydrateStruct0 %v", hydratedStruct.Type().String()))()

	if hydratedStruct.Type().String() == "common.Id" {
		println()
	}

	defer func() {
		e := recover()
		if e != nil {
			err = fmt.Errorf("panicked: %v", e)
		}
	}()

	hydratedElemStruct := IdempotentElem(hydratedStruct)
	dehydratedStruct = reflect.New(dehydration.DehydratedType).Elem()

	for _, field := range dehydration.fields {
		hydratedStructField := dehydration.hydratedType.Field(field.hydratedFieldIndex)
		dehydratedStructField := dehydration.DehydratedType.Field(field.dehydratedFieldIndex)
		dehydratedField := dehydratedStruct.Field(field.dehydratedFieldIndex)
		hydratedField := hydratedElemStruct.Field(field.hydratedFieldIndex)

		DebugLog(fmt.Sprintf(
			"dehydrateField %v | dehydrated type %v | hydrated type %v",
			hydratedStructField.Name,
			dehydratedStructField.Type.String(),
			hydratedStructField.Type.String(),
		))

		if !dehydratedField.CanSet() {
			return reflect.Value{}, fmt.Errorf(dehydratedStructField.Name)
		}

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
			typeId, ok := PolymorphRegistry.GetTypeId(hydratedField.Interface())
			if !ok {
				return reflect.Value{}, fmt.Errorf("dehydrate polymorph: %v", hydratedField.Type().String())
			}

			value, err := Dehydrate(hydratedField)
			if err != nil {
				return reflect.Value{}, fmt.Errorf("dehydrate polymorph: %v", err)
			}

			dehydratedField.FieldByName(TypeIdFieldName).Set(reflect.ValueOf(typeId))
			dehydratedField.FieldByName(ValueContainerFieldName).FieldByName(ValueFieldName).Set(value)
		} else if dehydratedStructField.Type.Kind() == reflect.Struct {
			value, err := dehydrateStruct0(hydratedField, field.dehydration)
			if err != nil {
				return reflect.Value{}, err
			}
			if !value.Type().AssignableTo(dehydratedField.Type()) {
				return reflect.Value{}, fmt.Errorf("unassignable: %v %v", value.Type().String(), dehydratedField.Type().String())
			}
			dehydratedField.Set(value)
		} else {
			dehydratedField.Set(hydratedField)
		}
	}
	return dehydratedStruct, nil
}

func reValue(value reflect.Value) reflect.Value {
	return reflect.ValueOf(value.Interface())
}

func isHydrationRef(field reflect.StructField) bool {
	value, ok := field.Tag.Lookup(HydrationTag)
	return ok && (value == HydrationRefTag)
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

func DebugLog(msg string) {
	if common.Config.DebugPrint {
		println(msg)
	}
}

func DebugLogf(s string, s2 ...interface{}) {
	DebugLog(fmt.Sprintf(s, s2...))
}
