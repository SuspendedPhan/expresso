package wasm

import (
	"expressionista/ast"
	"syscall/js"
)

type vue struct {
	ref      js.Value
	watch    js.Value
	computed js.Value
}

func bootstrapGoModule() {
	ast.SetupPrimitiveFunctions()
	ast.SetupProtoOrganisms()
	setupPixiSetters()
	goModule := makeEmptyObject()

	rootOrganism := ast.NewOrganism()
	rootOrganism.AddIntrinsicAttribute(ast.ProtoCircle.X)
	rootOrganism.AddIntrinsicAttribute(ast.ProtoCircle.Y)
	rootOrganism.AddIntrinsicAttribute(ast.ProtoCircle.Radius)

	goModule.Set("setupRootOrganism", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ref := args[0]
		watch := args[1]
		computed := args[2]
		vue := vue{ref, watch, computed}
		return setupOrganism(rootOrganism, vue)
	}).Value)

	goModule.Set("eval", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		circlePool := args[0]
		circles := args[1]
		render(rootOrganism, circlePool, circles)
		return js.Undefined()
	}))

	js.Global().Set("GoModule", goModule)
	println("after set")
}

func setupOrganism(organism *ast.Organism, vue vue) interface{} {
	attributes := vue.ref.Invoke()
	attributes.Set("value", getAttributesArray(organism, vue))
	organism.OnAttributesChanged.On(func() {
		attributes.Set("value", getAttributesArray(organism, vue))
	})

	returnValue := makeEmptyObject()
	returnValue.Set("attributes", attributes)
	return returnValue
}

func getAttributesArray(organism *ast.Organism, vue vue) js.Value {
	array := makeEmptyArray()
	for i, element := range organism.PlayerAttributes {
		element := element
		childValue := makeEmptyObject()
		childValue.Set("id", element.GetId())
		childValue.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return setupAttribute(element, vue)
		}))
		array.SetIndex(i, childValue)
	}
	return array
}

func setupAttribute(a *ast.Attribute, vue vue) js.Value {
	returnValue := makeEmptyObject()
	rootNodeId := vue.ref.Invoke(a.RootNode.GetId())
	returnValue.Set("id", a.GetId())
	returnValue.Set("rootNodeId", rootNodeId)
	rootNodeSetupFunc := vue.ref.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return setupNode(a.RootNode, vue)
	}))
	returnValue.Set("rootNodeSetupFunc", rootNodeSetupFunc)

	go forever(func() {
		<-a.OnRootNodeChanged
		rootNodeId.Set("value", a.RootNode.GetId())
	})

	return returnValue
}