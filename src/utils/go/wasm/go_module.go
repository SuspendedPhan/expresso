package main

import (
	"syscall/js"

	"expressioni.sta/evaluator"
)

func bootstrapGoModule() {
	goModule := makeEmptyObject()

	ev := evaluator.NewEvaluator()

	goModule.Set("Object", js.ValueOf(map[string]interface{}{
		"create": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			objectId := args[0].String()
			ev.ObjectCreate(objectId)
			return nil
		}),

		"setCloneCount": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			objectId := args[0].String()
			exprId := args[1].String()
			ev.ObjectSetCloneCount(objectId, exprId)
			return nil
		}),
		"addProperty": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			objectId := args[0].String()
			propertyId := args[1].String()
			ev.ObjectAddProperty(objectId, propertyId)
			return nil
		}),
	}))

	goModule.Set("Property", js.ValueOf(map[string]interface{}{
		"setExpr": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			objectId := args[0].String()
			propertyId := args[1].String()
			exprId := args[2].String()
			ev.PropertySetExpr(objectId, propertyId, exprId)
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

		"canvasObjectPathAppend": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			basePath := args[0].String()
			objectId := args[1].String()
			cloneId := args[2].String()
			return evaluator.CanvasObjectPathAppend(basePath, objectId, cloneId)
		}),

		"createCanvasPropertyPath": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			propertyId := args[0].String()
			canvasObjectPath := args[1].String()
			return evaluator.CreateCanvasPropertyPath(propertyId, canvasObjectPath)
		}),

		"createCloneCountCanvasPropertyPath": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			parentCanvasObjectPath := args[0].String()
			exObjectId := args[1].String()
			cloneCountPropertyId := args[2].String()
			return evaluator.CreateCloneCountCanvasPropertyPath(parentCanvasObjectPath, exObjectId, cloneCountPropertyId)
		}),
	}))

	goModule.Set("hello", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return "Hello, World!"
	}))

	js.Global().Set("GoModule", goModule)
}
