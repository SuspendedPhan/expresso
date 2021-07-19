package main

import (
	"syscall/js"
)

type ObjectMap = map[string]interface{}

func bootstrapGoModule() {
	goModule := makeObjectValue()
	goModule.Set("setupNode", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return js.Null()
	}).Value)

	js.Global().Set("GoModule", goModule)
	println("after set")
}

func makeObjectValue() js.Value {
	return js.ValueOf(make(ObjectMap))
}
