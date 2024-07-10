package main

import (
	"syscall/js"

	"expressioni.sta/evaluator"
)

func bootstrapGoModule() {
	goModule := makeEmptyObject()

	ev := evaluator.NewEvaluator()

	goModule.Set("addNumberExpr", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		ev.AddNumberExpr(id)
		return nil
	}))

	goModule.Set("setNumberExprValue", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		value := args[1].Float()
		ev.SetNumberExprValue(id, value)
		return nil
	}))

	goModule.Set("addCallExpr", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		ev.AddCallExpr(id)
		return nil
	}))

	goModule.Set("setCallExprArg0", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		argId := args[1].String()
		ev.SetCallExprArg0(id, argId)
		return nil
	}))

	goModule.Set("setCallExprArg1", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		argId := args[1].String()
		ev.SetCallExprArg1(id, argId)
		return nil
	}))

	goModule.Set("evalExpr", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		exprId := args[0].String()
		return ev.EvalExpr(exprId)
	}))

	goModule.Set("hello", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return "Hello, World!"
	}))

	js.Global().Set("GoModule", goModule)
}
