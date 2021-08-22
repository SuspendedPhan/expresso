package hydration

import (
	"expressionista/common"
	"fmt"
	"reflect"
)

func Rehydrate(dehydratedPolymorph reflect.Value, registry PolymorphRegistry) (_ reflect.Value, err error) {
	elem := IdempotentElem(IdempotentElem(dehydratedPolymorph))
	polymorph := Polymorph{
		TypeId: elem.FieldByName(TypeIdFieldName).String(),
		Value:  elem.FieldByName(ValueFieldName).Interface(),
	}
	return rehydratePolymorph(polymorph, registry)
}

func rehydratePolymorph(polymorph Polymorph, registry PolymorphRegistry) (_ reflect.Value, err error) {
	hnd := common.NewHandler(&err, "rehydratePolymorph")
	//hnd.DontRecover()
	defer hnd.Handle()

	t, err := polymorph.Type(registry)
	hnd.AssertNilErr(err)

	valueElem := IdempotentElem(reflect.ValueOf(polymorph.Value))
	hnd.Assert(valueElem.Kind() == reflect.Struct, "expected struct kind", valueElem.Kind())

	r, err := rehydrateStruct(valueElem, t, registry)
	hnd.AssertNilErr(err)

	return r, err
}

func rehydrateStruct(dehyElem reflect.Value, rehyElemType reflect.Type, registry PolymorphRegistry) (_ reflect.Value, err error) {
	hnd := common.NewHandler(&err, "rehydrateStruct", dehyElem.Type().String(), rehyElemType.String())
	defer hnd.Handle()

	rehyPtr := reflect.New(rehyElemType)
	rehy := rehyPtr.Elem()
	mappings := make([]FieldMapping, 0)
	for i := 0; i < rehyElemType.NumField(); i++ {
		rehySField := rehyElemType.Field(i)
		var dehyFieldName string
		if rehySField.Anonymous {
			dehyFieldName = rehySField.Type.Name()
		} else {
			dehyFieldName = rehySField.Name
		}

		dehySField, ok := dehyElem.Type().FieldByName(dehyFieldName)
		if ok {
			mappings = append(mappings, FieldMapping{
				dehyField:  dehyElem.FieldByName(dehyFieldName),
				dehySField: dehySField,
				rehyField:  rehy.Field(i),
				rehySField: rehySField,
			})
		}
	}

	hnd.Assert(
		dehyElem.NumField() == len(mappings),
		fmt.Sprintf("expected %v fields, actually got %v fields", dehyElem.NumField(), len(mappings)),
	)

	for _, m := range mappings {
		f, err := rehydrateField(m, registry)
		hnd.AssertNilErr(err)
		var fChecked reflect.Value
		if m.rehyField.Kind() != reflect.Ptr && m.rehyField.Kind() != reflect.Interface {
			fChecked = IdempotentElem(f)
		} else {
			fChecked = f
		}
		err = SetSafe(m.rehyField, fChecked)
		hnd.AssertNilErr(err)
	}
	return rehyPtr, nil
}

func rehydrateField(m FieldMapping, registry PolymorphRegistry) (_ reflect.Value, err error) {
	hnd := common.NewHandler(&err, "rehydrateField", m.rehySField.Name, m.rehyField.Type().String())
	defer hnd.Handle()

	if m.rehySField.Tag.Get(HydrationTag) == HydrationRefTag {
		rehyValue := reflect.Zero(m.rehySField.Type)
		hnd.Assert(rehyValue.Kind() == reflect.Ptr || rehyValue.Kind() == reflect.Interface)
		return rehyValue, nil
	} else if m.rehySField.Type.Kind() == reflect.Interface {
		rehyValue, err := Rehydrate(m.dehyField, registry)
		hnd.AssertNilErr(err)
		return rehyValue, nil
	} else if m.rehyField.Kind() == reflect.Struct {
		rehyValue, err := rehydrateStruct(m.dehyField, m.rehyField.Type(), registry)
		hnd.AssertNilErr(err)
		return rehyValue, nil
	} else {
		return m.dehyField, nil
	}
}

func SetSafe(dst reflect.Value, src reflect.Value) (err error) {
	hnd := common.NewHandler(&err, "attempt to set", dst.Type().String(), src.Type().String())
	defer hnd.HandleCatchPanics()
	hnd.Assert(src.IsValid(), "src invalid")
	hnd.Assert(dst.IsValid(), "dst invalid")
	dst.Set(src)
	return nil
}

type FieldMapping struct {
	dehyField  reflect.Value
	dehySField reflect.StructField
	rehyField  reflect.Value
	rehySField reflect.StructField
}
