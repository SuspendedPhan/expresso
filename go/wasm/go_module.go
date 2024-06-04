package main

import (
	"syscall/js"

	"expressioni.sta/evaluator"
)

func bootstrapGoModule() {
	goModule := makeEmptyObject()

	goModule.Set("eval", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return js.Undefined()
	}))

	goModule.Set("createEvaluator", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return createEvaluator(this, args)
	}))

	goModule.Set("hello", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return "Hello, World!"
	}))

	js.Global().Set("GoModule", goModule)
}

func EvalResultToJsValue(r evaluator.Result) js.Value {
	return js.ValueOf(r.Value)
}
