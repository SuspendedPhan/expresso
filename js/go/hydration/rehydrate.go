package hydration

import (
	"expressionista/common"
	"fmt"
	"reflect"
)

func Rehydrate(dehydratedObj reflect.Value, rehydratedType reflect.Type, registry PolymorphRegistry) (_ reflect.Value, err error) {
	hnd := common.NewHandler(&err, "Rehydrate")
	defer hnd.Handle()

	r, err := rehydrate(dehydratedObj, rehydratedType, registry)
	hnd.AssertNilErr(err)

	err = populateRefs(r)
	hnd.AssertNilErr(err)

	return r, nil
}

func populateRefs(obj reflect.Value) (err error) {
	hnd := common.NewHandler(&err, "populateRefs")
	defer hnd.Handle()

	ptrByID := make(map[string]interface{})
	traverse(obj, func(v reflect.Value) (shouldTraverseChildren bool) {
		method := v.MethodByName("GetId")
		if method.IsValid() {
			hnd.Assert(v.Kind() == reflect.Ptr, "kind == ptr?")
			ptr := v.Interface()

			idRet := method.Call([]reflect.Value{})
			hnd.Assert(len(idRet) == 0, "idRet?")
			id := idRet[0]

			hnd.Assert(id.Kind() == reflect.String, "kind == string?")
			ptrByID[id.String()] = ptr
			return false
		}
		return true
	})
	return nil
}

func traverse(obj reflect.Value, visit func(v reflect.Value) (shouldTraverseChildren bool)) {
	shouldTraverse := visit(obj)
	elem := IdempotentElem(obj)
	if elem.Kind() == reflect.Struct && shouldTraverse {
		for i := 0; i < elem.NumField(); i++ {
			field := elem.Field(i)
			traverse(field, visit)
		}
	}
}

func rehydrate(dehydratedObj reflect.Value, rehydratedType reflect.Type, registry PolymorphRegistry) (_ reflect.Value, err error) {
	hnd := common.NewHandler(&err, "Rehydrate", rehydratedType.String())
	defer hnd.Handle()

	rehydratedElemType := IdempotentTypeElem(rehydratedType)

	if rehydratedElemType.Kind() == reflect.Interface {
		r, err := rehydratePolymorph(dehydratedObj, registry)
		hnd.AssertNilErr(err)
		return r, nil
	}

	if rehydratedElemType.Kind() == reflect.Struct {
		r, err := rehydrateStruct(dehydratedObj, rehydratedElemType, registry)
		hnd.AssertNilErr(err)
		return r, nil
	}

	if rehydratedElemType.Kind() == reflect.Slice {
		r, err := rehydrateSlice(dehydratedObj, rehydratedElemType, registry)
		hnd.AssertNilErr(err)
		return r, nil
	}

	DebugLog("Rehydrate: default case: " + dehydratedObj.Type().String())
	return dehydratedObj, nil
}

func rehydrateSlice(dehydratedObj reflect.Value, rehydratedType reflect.Type, registry PolymorphRegistry) (_ reflect.Value, err error) {
	hnd := common.NewHandler(&err, "rehydrateSlice", rehydratedType.String())
	defer hnd.Handle()

	rr := make([]interface{}, 0)
	for i := 0; i < dehydratedObj.Len(); i++ {
		de := dehydratedObj.Index(i)
		r, err := Rehydrate(de, rehydratedType.Elem(), registry)
		hnd.AssertNilErr(err, i)
		rr = append(rr, r.Interface())
	}
	return reflect.ValueOf(rr), nil
}

func rehydrateStruct(dehydratedObj reflect.Value, rehydratedType reflect.Type, registry PolymorphRegistry) (_ reflect.Value, err error) {
	rehyElemType := IdempotentTypeElem(rehydratedType)
	dehyElem := IdempotentElem(dehydratedObj)
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
			fChecked = IdempotentElem(f).Value
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
	} else {
		rehyValue, err := Rehydrate(m.dehyField, m.rehyField.Type(), registry)
		hnd.AssertNilErr(err)
		return rehyValue, nil
	}
}

func rehydratePolymorph(dehydratedPolymorph reflect.Value, registry PolymorphRegistry) (_ reflect.Value, err error) {
	hnd := common.NewHandler(&err, "rehydratePolymorph")
	defer hnd.Handle()

	elem := IdempotentElem(IdempotentElem(dehydratedPolymorph).Value)
	typeId := elem.FieldByName(TypeIdFieldName)
	value := elem.FieldByName(ValueFieldName)
	hnd.Assert(typeId.IsValid(), "typeId valid?")
	hnd.Assert(value.IsValid(), "value valid?")
	polymorph := Polymorph{
		TypeId: typeId.String(),
		Value:  value.Interface(),
	}

	t, err := polymorph.Type(registry)
	hnd.AssertNilErr(err)

	valueElem := IdempotentElem(reflect.ValueOf(polymorph.Value))
	hnd.Assert(valueElem.Kind() == reflect.Struct, "expected struct kind", valueElem.Kind())

	r, err := rehydrateStruct(valueElem.Value, t, registry)
	hnd.AssertNilErr(err)

	return r, err
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
