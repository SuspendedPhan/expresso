package main

import (
	"github.com/vishalkuo/bimap"
	"reflect"
	"strconv"
	"syscall/js"
)

type ObjectMap = map[string]interface{}

func bootstrapGoModule() {
	nextId := 0
	goObjectById := bimap.NewBiMap()

	newFuncs := makeObjectValue()
	newFuncs.Set("NewFrog", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		id := strconv.Itoa(nextId)
		frog := Frog{}
		frog.id = id
		frog.jumps = 10
		goObjectById.Insert(id, &frog)
		nextId++
		return js.ValueOf(id)
	}).Value)

	invokeFunc := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		invokeData := args[0]
		objectId := invokeData.Get("objectId").String()
		methodName := invokeData.Get("methodName").String()
		invokeArgs := invokeData.Get("args")
		println("invoked")
		println(objectId)
		println(methodName)
		goObject, _ := goObjectById.Get(objectId)
		reflectedArgs := make([]reflect.Value, 0)
		for i := 0; i < invokeArgs.Get("length").Int(); i++ {
			invokeArg := invokeArgs.Get(strconv.Itoa(i))
			if primitive := invokeArg.Get("primitive"); !primitive.IsUndefined() {
				reflectedArg := reflect.ValueOf(primitive.Int())
				reflectedArgs = append(reflectedArgs, reflectedArg)
			} else if objectId := invokeArg.Get("objectId"); !objectId.IsUndefined() {
				argGoObject, _ := goObjectById.Get(objectId.String())
				reflectedArg := reflect.ValueOf(argGoObject)
				reflectedArgs = append(reflectedArgs, reflectedArg)
			} else {
				panic("ahh")
			}
		}

		reflectedObject := reflect.ValueOf(goObject)
		reflectedReturns := reflectedObject.MethodByName(methodName).Call(reflectedArgs)
		if len(reflectedReturns) == 0 {
			return js.Undefined()
		} else {
			reflectedReturn := reflectedReturns[0]
			switch reflectedReturn.Type().Name() {
			case "string":
				return reflectedReturnToReturnValue(reflectedReturn)
			case "int":
				return reflectedReturnToReturnValue(reflectedReturn)
			default:
				// todo: make GetOrPanic function
				id, _ := goObjectById.GetInverse(reflectedReturn.Interface())
				returnValue := makeObjectValue()
				returnValue.Set("objectId", id)
				return returnValue
			}
		}
	}).Value

	goModule := makeObjectValue()
	goModule.Set("newFuncs", newFuncs)
	goModule.Set("invokeFunc", invokeFunc)

	js.Global().Set("GoModule", goModule)
	println("after set")
}

func reflectedReturnToReturnValue(reflectedReturn reflect.Value) js.Value {
	returnValue := makeObjectValue()
	returnValue.Set("primitive", js.ValueOf(reflectedReturn.Interface()))
	return returnValue
}

func makeObjectValue() js.Value {
	return js.ValueOf(make(ObjectMap))
}
