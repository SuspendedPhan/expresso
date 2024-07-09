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
		arg0Id := args[1].String()
		arg0Type := args[2].String()
		arg1Id := args[3].String()
		arg1Type := args[4].String()
		ev.AddExpr(id, arg0Id, arg0Type, arg1Id, arg1Type)
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
