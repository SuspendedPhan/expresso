package main

import (
	"syscall/js"

	"expressioni.sta/evaluator"
)

func bootstrapGoModule() {
	goModule := makeEmptyObject()

	ev := evaluator.NewEvaluator()

	goModule.Set("eval", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return ev.Eval()
	}))

	goModule.Set("createAttribute", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		rootExprId := args[1].String()
		attr := ev.CreateAttribute(id, rootExprId)
		return map[string]interface{}{
			"setExprId": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				attr.RootExprId = args[0].String()
				return nil
			}),
		}
	}))

	goModule.Set("setRootAttributeId", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ev.RootAttributeId = args[0].String()
		return nil
	}))

	goModule.Set("getRootAttributeExprId", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return ev.GetRootAttribute().RootExprId
	}))

	goModule.Set("createNumberExpr", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		value := args[1].Float()
		ev.CreateNumberExpr(id, value)
		return nil
	}))

	goModule.Set("createPrimitiveFunctionCallExpr", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		argIds := make([]string, args[1].Length())
		for i := 0; i < args[1].Length(); i++ {
			argIds[i] = args[1].Index(i).String()
		}
		ev.CreatePrimitiveFunctionCallExpr(id, argIds)
		return nil
	}))

	goModule.Set("hello", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return "Hello, World!"
	}))

	js.Global().Set("GoModule", goModule)
}
