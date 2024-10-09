// File: go_module.go

package main

import (
	"syscall/js"

	"expressioni.sta/evaluator"
	"github.com/davecgh/go-spew/spew"
)

var logger = NewLogger("go_module.go")

func deferLogger() {
	if r := recover(); r != nil {
		logger.Error("Caught error:", r)
	}
}

func bootstrapGoModule() {
	logger.Log("bootstrapGoModule")

	goModule := makeEmptyObject()

	ev := evaluator.NewEvaluator(logger)

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

		"addBasicProperty": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			logger.Log("ExObject.addBasicProperty", args)
			exObjectId := args[0].String()
			propertyId := args[1].String()
			ev.ExObjectAddBasicProperty(exObjectId, propertyId)
			return nil
		}),

		"addChild": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			logger.Log("ExObject.addChild", args)
			parentId := args[0].String()
			childId := args[1].String()
			ev.ExObjectAddChild(parentId, childId)
			return nil
		}),

		"setCloneNumberTarget": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			logger.Log("ExObject.setCloneNumberTarget", args)
			exObjectId := args[0].String()
			cloneNumberTargetId := args[1].String()
			ev.ExObjectSetCloneNumberTarget(exObjectId, cloneNumberTargetId)
			return nil
		}),

		"setComponent": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			logger.Log("ExObject.setComponent", args)
			exObjectId := args[0].String()
			componentId := args[1].String()
			ev.ExObjectSetComponent(exObjectId, componentId)
			return nil
		}),
	}))

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

		"setComponentParameterId": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			propertyId := args[0].String()
			componentParameterId := args[1].String()
			ev.PropertySetComponentParameterId(propertyId, componentParameterId)
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
		"setTargetId": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			id := args[0].String()
			targetId := args[1].String()
			logger.Log("ReferenceExpr.setTargetId", id, targetId)
			ev.ReferenceExprSetTargetId(id, targetId)
			return nil
		}),
		"setTargetKind": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			id := args[0].String()
			targetKind := args[1].String()
			logger.Log("ReferenceExpr.setTargetKind", id, targetKind)
			ev.ReferenceExprSetTargetKind(id, targetKind)
			return nil
		}),
	}))

	goModule.Set("Component", js.ValueOf(map[string]interface{}{
		"create": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			componentId := args[0].String()
			ev.ComponentCreate(componentId)
			return nil
		}),
		"addParameterProperty": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			componentId := args[0].String()
			parameterId := args[1].String()
			ev.ComponentAddParameter(componentId, parameterId)
			return nil
		}),
		"addBasicProperty": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			componentId := args[0].String()
			propertyId := args[1].String()
			ev.ComponentAddBasicProperty(componentId, propertyId)
			return nil
		}),
		"addRootObject": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			componentId := args[0].String()
			rootObjectId := args[1].String()
			ev.ComponentAddRootObject(componentId, rootObjectId)
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

			// fmt.Println(evaluation.String())

			getObjectResultCountFunc := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				return evaluation.GetObjectResultCount()
			})

			getPropertyResultCountFunc := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				objectResultIndex := args[0].Int()
				return evaluation.GetPropertyResultCount(objectResultIndex)
			})

			getPropertyIdFunc := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				objectResultIndex := args[0].Int()
				propertyResultIndex := args[1].Int()
				return evaluation.GetPropertyId(objectResultIndex, propertyResultIndex)
			})

			getPropertyValueFunc := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				objectResultIndex := args[0].Int()
				propertyResultIndex := args[1].Int()
				return evaluation.GetPropertyValue(objectResultIndex, propertyResultIndex)
			})

			var disposeFunc js.Func
			disposeFunc = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				getObjectResultCountFunc.Release()
				getPropertyResultCountFunc.Release()
				getPropertyIdFunc.Release()
				getPropertyValueFunc.Release()
				disposeFunc.Release() // Also release the dispose function itself
				return nil
			})

			// Expose the functions to JavaScript
			return map[string]interface{}{
				"getObjectResultCount":   getObjectResultCountFunc,
				"getPropertyResultCount": getPropertyResultCountFunc,
				"getPropertyId":          getPropertyIdFunc,
				"getPropertyValue":       getPropertyValueFunc,
				"dispose":                disposeFunc,
			}
		}),

		"reset": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			ev = evaluator.NewEvaluator(logger)
			return nil
		}),

		"debug": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			spew.Dump(ev)
			// fmt.Println(ev)
			return nil
		}),
	}))

	goModule.Set("hello", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		logger.Log("hello from go_module.go")
		return "Hello, World!"
	}))

	js.Global().Set("GoModule", goModule)
}
