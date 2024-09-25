// File: go_module.go

package main

import (
	"syscall/js"

	"expressioni.sta/evaluator"
	"github.com/davecgh/go-spew/spew"
)

var logger = evaluator.NewLogger("go_module.go")

func deferLogger() {
	if r := recover(); r != nil {
		logger.Error("Caught error:", r)
	}
}

func bootstrapGoModule() {
	logger.Log("bootstrapGoModule")

	goModule := makeEmptyObject()

	ev := evaluator.NewEvaluator()

	goModule.Set("ExObject", js.ValueOf(map[string]interface{}{
		"create": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			logger.Log("ExObject.create", args)
			exObjectId := args[0].String()
			ev.ExObjectCreate(exObjectId)
			return nil
		}),

		"setCloneCountProperty": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			logger.Log("ExObject.setCloneCountProperty", args)
			exObjectId := args[0].String()
			exprId := args[1].String()
			ev.ExObjectSetCloneCountProperty(exObjectId, exprId)
			return nil
		}),

		"addComponentParameterProperty": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			logger.Log("ExObject.addComponentParameterProperty", args)
			exObjectId := args[0].String()
			propertyId := args[1].String()
			ev.ExObjectAddComponentParameterProperty(exObjectId, propertyId)
			return nil
		}),

		// addBasicProperty(exObjectId: string, propertyId: string): void;

		"addBasicProperty": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			logger.Log("ExObject.addBasicProperty", args)
			exObjectId := args[0].String()
			propertyId := args[1].String()
			ev.ExObjectAddBasicProperty(exObjectId, propertyId)
			return nil
		}),
	}))

	// todp CNT

	goModule.Set("Property", js.ValueOf(map[string]interface{}{
		"create": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			propertyId := args[0].String()
			ev.PropertyCreate(propertyId)
			return nil
		}),

		"setExpr": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			propertyId := args[0].String()
			exprId := args[1].String()
			ev.PropertySetExpr(propertyId, exprId)
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
			logger.Log("CallExpr.setArg0", id, argId)
			ev.CallExprSetArg0(id, argId)
			return nil
		}),
		"setArg1": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			id := args[0].String()
			argId := args[1].String()
			logger.Log("CallExpr.setArg1", id, argId)
			ev.CallExprSetArg1(id, argId)
			return nil
		}),
	}))

	goModule.Set("ReferenceExpr", js.ValueOf(map[string]interface{}{
		"create": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			id := args[0].String()

			targetId := ""
			if args[1].Type() != js.TypeNull {
				targetId = args[1].String()
			}

			targetKind := args[2].String()

			ev.ReferenceExprCreate(id)
			ev.ReferenceExprSetTargetId(id, targetId)
			ev.ReferenceExprSetTargetKind(id, targetKind)
			return nil
		}),
	}))

	goModule.Set("Evaluator", js.ValueOf(map[string]interface{}{
		"addRootExObject": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			logger.Log("Evaluator.addRootExObject", args)
			exObjectId := args[0].String()
			ev.AddRootExObject(exObjectId)
			return nil
		}),

		"eval": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			defer deferLogger()

			evaluation := ev.Eval()
			getResultFunc := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				attributeSceneInstancePath := args[0].String()
				result, err := evaluation.GetResult(attributeSceneInstancePath)
				if err != nil {
					return 0
				}
				return result
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

		"reset": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			ev = evaluator.NewEvaluator()
			return nil
		}),

		"canvasExObjectPathAppend": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			basePath := args[0].String()
			exObjectId := args[1].String()
			cloneId := args[2].String()
			return evaluator.CanvasObjectPathAppend(basePath, exObjectId, cloneId)
		}),

		"createCanvasPropertyPath": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			propertyId := args[0].String()
			canvasExObjectPath := args[1].String()
			return evaluator.CreateCanvasPropertyPath(propertyId, canvasExObjectPath)
		}),

		"createCloneCountCanvasPropertyPath": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			parentCanvasExObjectPath := args[0].String()
			exExObjectId := args[1].String()
			cloneCountPropertyId := args[2].String()
			return evaluator.CreateCloneCountCanvasPropertyPath(parentCanvasExObjectPath, exExObjectId, cloneCountPropertyId)
		}),

		"debug": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			spew.Dump(ev)
			return nil
		}),
	}))

	goModule.Set("hello", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		logger.Log("hello from go_module.go")
		return "Hello, World!"
	}))

	js.Global().Set("GoModule", goModule)
}
