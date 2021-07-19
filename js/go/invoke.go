package main

import (
	"math/rand"
	"reflect"
	"strconv"
	"syscall/js"
)

type Invoker struct {
	reflectedObjectById map[string]reflect.Value
}

func (invoker *Invoker) invoke(invokeData js.Value) js.Value {
	objectId := invokeData.Get("objectId").String()
	methodName := invokeData.Get("methodName").String()
	argsJs := unpackJsArray(invokeData.Get("args"))
	reflectedObject := invoker.reflectedObjectById[objectId]
	reflectedArgs := make([]reflect.Value, 0)
	for _, argJs := range argsJs {
		reflectedArgs = append(reflectedArgs, invoker.argJsToObjectReflected(argJs))
	}
	returnReflected := reflectedObject.MethodByName(methodName).Call(reflectedArgs)[0]
	return invoker.reflectedObjectToJs(returnReflected)
}

func unpackJsArray(array js.Value) []js.Value {
	return make([]js.Value, 0)
}

func (invoker *Invoker) argJsToObjectReflected(argJs js.Value) reflect.Value {
	if primitive := argJs.Get("primitive"); !primitive.IsUndefined() {

	} else if objectId := argJs.Get("objectId"); !objectId.IsUndefined() {

	} else {
		panic("invoke")
	}
	return reflect.ValueOf(nil)
}

func (invoker Invoker) reflectedObjectToJs(reflected reflect.Value) js.Value {
	return js.Null()
}

func (invoker *Invoker) goObjectToJs(goObject interface{}) js.Value {
	reflectedObject := reflect.ValueOf(goObject)
	id := strconv.Itoa(rand.Int())
	invoker.reflectedObjectById[id] = reflectedObject

	props := make(map[string]js.Value)
	props["objectId"] = js.ValueOf(id)
	return js.ValueOf(props)
}
