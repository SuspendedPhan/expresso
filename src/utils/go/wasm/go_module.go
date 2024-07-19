package main

import (
	"syscall/js"

	"expressioni.sta/evaluator"
)

func bootstrapGoModule() {
	goModule := makeEmptyObject()

	ev := evaluator.NewEvaluator()

	goModule.Set("Component", js.ValueOf(map[string]interface{}{
		"create": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			id := args[0].String()
			ev.ComponentCreate(id)
			return nil
		}),
		"setCloneCount": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			id := args[0].String()
			cloneCount := args[1].Int()
			ev.ComponentSetCloneCount(id, cloneCount)
			return nil
		}),
		"addAttribute": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			componentId := args[0].String()
			attributeId := args[1].String()
			ev.ComponentAddAttribute(componentId, attributeId)
			return nil
		}),
	}))

	goModule.Set("Attribute", js.ValueOf(map[string]interface{}{
		"setExpr": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			componentId := args[0].String()
			attributeId := args[1].String()
			exprId := args[2].String()
			ev.AttributeSetExpr(componentId, attributeId, exprId)
			return nil
		}),
	}))

	goModule.Set("NumberExpr", js.ValueOf(map[string]interface{}{
		"create": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			id := args[0].String()
			ev.NumberExprCreate(id)
			return nil
		}),
		"setValue": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			id := args[0].String()
			value := args[1].Float()
			ev.NumberExprSetValue(id, value)
			return nil
		}),
	}))

	goModule.Set("CallExpr", js.ValueOf(map[string]interface{}{
		"create": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			id := args[0].String()
			ev.CallExprCreate(id)
			return nil
		}),
		"setArg0": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			id := args[0].String()
			argId := args[1].String()
			ev.CallExprSetArg0(id, argId)
			return nil
		}),
		"setArg1": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			id := args[0].String()
			argId := args[1].String()
			ev.CallExprSetArg1(id, argId)
			return nil
		}),
	}))

	goModule.Set("Evaluator", js.ValueOf(map[string]interface{}{
		"eval": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			evaluation := ev.Eval()
			getResultFunc := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				attributeSceneInstancePath := args[0].String()
				return evaluation.GetResult(attributeSceneInstancePath)
			})

			var disposeFunc js.Func
			disposeFunc = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				getResultFunc.Release()
				disposeFunc.Release()
				return nil
			})

			return js.ValueOf(map[string]interface{}{
				"getResult": getResultFunc,
				"dispose":   disposeFunc,
			})
		}),

		"sceneInstancePathAppend": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			basePath := args[0].String()
			componentId := args[1].String()
			cloneId := args[2].String()
			return evaluator.SceneInstancePathAppend(basePath, componentId, cloneId)
		}),

		"createAttributeSceneInstancePath": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			attributeId := args[0].String()
			sceneInstancePath := args[1].String()
			return evaluator.CreateAttributeSceneInstancePath(attributeId, sceneInstancePath)
		}),
	}))

	goModule.Set("hello", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return "Hello, World!"
	}))

	js.Global().Set("GoModule", goModule)
}
