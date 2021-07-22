package main

import (
	"encoding/json"
	"syscall/js"
)

type vue struct {
	ref      js.Value
	watch    js.Value
	computed js.Value
}

func bootstrapGoModule() {
	setupPrimitiveFunctions()
	goModule := makeObjectValue()

	goModule.Set("setupRootOrganism", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ref := args[0]
		watch := args[1]
		computed := args[2]
		organism := NewOrganism()
		attribute := organism.addAttribute()
		node := NewNumberNode(10)
		attribute.setRootNode(&node)
		vue := vue{ref, watch, computed}
		text, _ := json.Marshal(organism)
		println(string(text))
		return setupOrganism(organism, vue)
	}).Value)

	js.Global().Set("GoModule", goModule)
	println("after set")
}

func setupOrganism(organism *Organism, vue vue) interface{} {
	attributes := vue.ref.Invoke()
	attributes.Set("value", getAttributesArray(organism, vue))
	organism.onAttributesChanged.on(func() {
		attributes.Set("value", getAttributesArray(organism, vue))
	})

	returnValue := makeObjectValue()
	returnValue.Set("attributes", attributes)
	return returnValue
}

func getAttributesArray(organism *Organism, vue vue) js.Value {
	array := makeEmptyArray()
	for i, element := range organism.Attributes {
		element := element
		childValue := makeObjectValue()
		childValue.Set("id", element.getId())
		childValue.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return setupAttribute(element, vue)
		}))
		array.SetIndex(i, childValue)
	}
	return array
}

func setupAttribute(a *Attribute, vue vue) js.Value {
	returnValue := makeObjectValue()
	rootNodeId := vue.ref.Invoke(a.RootNode.getId())
	returnValue.Set("id", a.getId())
	returnValue.Set("rootNodeId", rootNodeId)
	rootNodeSetupFunc := vue.ref.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return setupNode(a.RootNode, vue)
	}))
	returnValue.Set("rootNodeSetupFunc", rootNodeSetupFunc)

	go forever(func() {
		<-a.onRootNodeChanged
		rootNodeId.Set("value", a.RootNode.getId())
	})

	return returnValue
}
