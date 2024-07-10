package main

import (
	"syscall/js"

	"expressioni.sta/evaluator"
)

func bootstrapGoModule() {
	goModule := makeEmptyObject()

	ev := evaluator.NewEvaluator()

	goModule.Set("addValue", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		value := args[1].Float()
		ev.AddValue(id, value)
		return nil
	}))

	goModule.Set("addExpr", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		ev.AddExpr(id)
		return nil
	}))

	goModule.Set("setExprArg0", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		argId := args[1].String()
		argType := args[2].String()
		ev.SetExprArg0(id, argId, argType)
		return nil
	}))

	goModule.Set("setExprArg1", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		argId := args[1].String()
		argType := args[2].String()
		ev.SetExprArg1(id, argId, argType)
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
