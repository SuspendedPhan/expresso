package main

import (
	"fmt"
	"syscall/js"

	"expressioni.sta/evaluator"
)

func bootstrapGoModule() {
	goModule := makeEmptyObject()

	ev := evaluator.NewEvaluator()

	goModule.Set("setRootAttributeId", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ev.RootAttributeId = args[0].String()
		return nil
	}))

	goModule.Set("getRootAttributeExprId", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return ev.GetRootAttribute().RootExprId
	}))

	goModule.Set("debug", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ev.Debug()
		return nil
	}))

	goModule.Set("eval", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return ev.Eval()
	}))

	goModule.Set("createAttribute", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		attr := ev.CreateAttribute(id)
		return map[string]interface{}{
			"setExprId": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				fmt.Println("go_module: setting expr id", args[0].String())
				attr.RootExprId = args[0].String()
				return nil
			}),
		}
	}))

	goModule.Set("createNumberExpr", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		value := args[1].Float()
		ev.CreateNumberExpr(id, value)
		return nil
	}))

	goModule.Set("createPrimitiveFunctionCallExpr", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := args[0].String()
		expr := ev.CreatePrimitiveFunctionCallExpr(id)
		return map[string]interface{}{
			"setArgIds": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				exprArgs := args[0]
				argIds := make([]string, exprArgs.Length())
				for i := 0; i < exprArgs.Length(); i++ {
					argIds[i] = exprArgs.Index(i).String()
				}
				expr.ArgIds = argIds
				return nil
			}),
		}
	}))

	goModule.Set("hello", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return "Hello, World!"
	}))

	js.Global().Set("GoModule", goModule)
}