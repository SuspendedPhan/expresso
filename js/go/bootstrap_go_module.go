package main

import (
	"reflect"
	"syscall/js"
)

func bootstrapGoModule() {
	invoker := Invoker{reflectedObjectById: make(map[string]reflect.Value)}

	invokeFunc := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return invoker.invoke(args[0])
	})

	typeRegistry := NewTypeRegistry()
	typeRegistry.register(reflect.TypeOf(abser{}))

	goModule := make(map[string]js.Value)
	goModule["invoke"] = invokeFunc.Value

	for name, reflectType := range typeRegistry.typeByName {
		goModule[name] = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			goObject := reflect.New(reflectType).Interface()
			return invoker.goObjectToJs(goObject)
		}).Value
	}
}
