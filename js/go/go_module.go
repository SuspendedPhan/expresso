package main

import (
	"syscall/js"
)

type vue struct {
	ref      js.Value
	watch    js.Value
	computed js.Value
}

func bootstrapGoModule() {
	setupPrimitiveFunctions()
	setupProtoOrganisms()
	goModule := makeEmptyObject()

	rootOrganism := NewOrganism()
	attribute := rootOrganism.addAttribute()
	node := NewNumberNode(10)
	attribute.setRootNode(&node)

	goModule.Set("setupRootOrganism", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ref := args[0]
		watch := args[1]
		computed := args[2]
		vue := vue{ref, watch, computed}
		return setupOrganism(rootOrganism, vue)
	}).Value)

	goModule.Set("eval", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		circlePool := args[0]
		render(circlePool, rootOrganism)
		return js.Undefined()
	}))

	js.Global().Set("GoModule", goModule)
	println("after set")
}

func setupOrganism(organism *Organism, vue vue) interface{} {
	attributes := vue.ref.Invoke()
	attributes.Set("value", getAttributesArray(organism, vue))
	organism.onAttributesChanged.on(func() {
		attributes.Set("value", getAttributesArray(organism, vue))
	})

	returnValue := makeEmptyObject()
	returnValue.Set("attributes", attributes)
	return returnValue
}

func getAttributesArray(organism *Organism, vue vue) js.Value {
	array := makeEmptyArray()
	for i, element := range organism.Attributes {
		element := element
		childValue := makeEmptyObject()
		childValue.Set("id", element.getId())
		childValue.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return setupAttribute(element, vue)
		}))
		array.SetIndex(i, childValue)
	}
	return array
}

func setupAttribute(a *Attribute, vue vue) js.Value {
	returnValue := makeEmptyObject()
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
