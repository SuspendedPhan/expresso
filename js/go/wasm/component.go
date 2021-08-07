package wasm

import (
	"fmt"
	"reflect"
	"syscall/js"
)

type StringRef struct {
	value chan string
}

type ArrayRef struct {
	elements chan []js.Value
}

type Component struct {
	Id        string
	SetupFunc func() js.Value
}

func toJsValue(object interface{}, vue vue) js.Value {
	fmt.Printf("%+v\n", object)
	reflectedObject := reflect.ValueOf(object)
	println(reflectedObject.Type().String())
	switch object.(type) {
	case string, int:
		return js.ValueOf(object)
	case StringRef:
		stringRef := object.(StringRef)
		ref := vue.ref.Invoke("")

		go forever(func() {
			ref.Set("value", <-stringRef.value)
		})

		return ref
	case ArrayRef:
		arrayRef := object.(ArrayRef)
		ref := vue.ref.Invoke(makeEmptyArray())

		go forever(func() {
			ref.Set("value", makeArray(<-arrayRef.elements))
		})

		return ref
	case func() js.Value:
		return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return object.(func() js.Value)()
		}).Value
	case func(value js.Value):
		return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			object.(func(value js.Value))(args[0])
			return js.Undefined()
		}).Value
	case func():
		return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			object.(func())()
			return js.Undefined()
		}).Value
	default:
		if reflectedObject.Kind() == reflect.Struct {
			return structToJsValue(reflectedObject, vue)
		} else if reflectedObject.Kind() == reflect.Ptr {
			return structToJsValue(reflectedObject.Elem(), vue)
		}
		panic("what?")
	}
}

func structToJsValue(reflectedObject reflect.Value, vue vue) js.Value {
	value := makeEmptyObject()
	for i := 0; i < reflectedObject.Type().NumField(); i++ {
		if !reflectedObject.Field(i).CanInterface() {
			continue
		}
		fieldName := reflectedObject.Type().Field(i).Name
		println(fieldName)
		field := reflectedObject.Field(i).Interface()
		switch field.(type) {
		case Component:
			value.Set("Id", field.(Component).Id)
			value.Set("SetupFunc", toJsValue(field.(Component).SetupFunc, vue))
		default:
			value.Set(fieldName, toJsValue(field, vue))
		}
	}
	return value
}
