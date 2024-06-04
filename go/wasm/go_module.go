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
		arg := args[0]
		e := evaluator.Evaluator{
			Value: arg.Get("Value").Float(),
		}

		ret := makeEmptyObject()
		ret.Set("eval", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			r := e.Eval()
			return EvalResultToJsValue(r)
		}))
		return ret
	}))

	goModule.Set("hello", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return "Hello, World!"
	}))

	js.Global().Set("GoModule", goModule)
}

func EvalResultToJsValue(r evaluator.Result) js.Value {
	return js.ValueOf(r.Value)
}
