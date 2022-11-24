package main

import (
	"expressioni.sta/ast"
	"strconv"
	"syscall/js"
)

type vue struct {
	ref         js.Value
	watch       js.Value
	computed    js.Value
	readonly    js.Value
	onUnmounted js.Value

	// The ElementLayout.ts class.
	elementLayoutClass js.Value
}

// attributeContext contains state for an Attribute Gue Component's descendants.
type attributeContext struct {
	nodeIdToNode map[string]ast.Node
	layout       ElementLayout
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
		vue := vue{ref, watch, computed, args[3], args[4], args[5]}
		return setupOrganism(rootOrganism, vue)
	}).Value)

	goModule.Set("setupExpressor", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ref := args[0]
		watch := args[1]
		computed := args[2]
		vue := vue{ref, watch, computed, args[3], args[4], args[5]}
		return setupExpressor(vue)
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
	returnValue.Set("name", organism.GetName())
	returnValue.Set("id", organism.GetId())
	returnValue.Set("addAttribute", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		organism.AddAttribute()
		return nil
	}))
	return returnValue
}

func setupExpressor(vue vue) js.Value {
	count := 0

	rootOrgs := make([]*ast.Organism, 0)
	rootOrgsRef := vue.ref.Invoke()
	rootOrgsRef.Set("value", makeEmptyArray())

	ret := makeEmptyObject()
	ret.Set("rootOrganisms", rootOrgsRef)
	ret.Set("addOrganism", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		org := ast.NewOrganism()
		org.SetName("organism" + strconv.Itoa(count))
		count++
		rootOrgs = append(rootOrgs, org)

		rootOrgsRef.Set("value", getOrganismsArray(rootOrgs, vue))
		return nil
	}))
	return ret
}

// getOrganismsArray returns [{ id, setupFunc }]
func getOrganismsArray(organisms []*ast.Organism, vue vue) js.Value {
	arr := makeEmptyArray()
	for i, el := range organisms {
		el := el
		childValue := makeEmptyObject()
		childValue.Set("id", el.GetId())
		childValue.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return setupOrganism(el, vue)
		}))
		arr.SetIndex(i, childValue)
	}
	return arr
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
	nodeIdToNode := make(map[string]ast.Node)
	layout := NewElementLayout(vue.elementLayoutClass, js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// getRootNodeFunc
		return a.RootNode.GetId()
	}).Value, js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// getChildrenFunc
		nodeId := args[0].String()
		return getChildrenIds(nodeId, nodeIdToNode)
	}).Value, js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// getKeyFunc
		return args[0]
	}).Value)

	rootNodeIdRef := vue.ref.Invoke()
	rootNodeIdRef.Set("value", a.RootNode.GetId())
	returnValue.Set("id", a.GetId())
	returnValue.Set("rootNodeId", rootNodeIdRef)
	returnValue.Set("name", a.GetName())
	returnValue.Set("rootNodeSetupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return setupNode(a.RootNode, vue, attributeContext{
			nodeIdToNode: nodeIdToNode,
			layout:       layout,
		})
	}))

	offRootNodeChanged := a.OnRootNodeChanged.On(func() {
		rootNodeIdRef.Set("value", a.RootNode.GetId())
	})
	vue.onUnmounted.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		offRootNodeChanged()
		return nil
	}))

	return returnValue
}

// getChildrenIds returns a js array of ids for the given node, given an ID map.
func getChildrenIds(nodeId string, nodeIdToNode map[string]ast.Node) js.Value {
	ret := makeEmptyArray()
	node := nodeIdToNode[nodeId]
	for i, child := range node.GetChildren() {
		ret.SetIndex(i, child.GetId())
	}
	return ret
}
