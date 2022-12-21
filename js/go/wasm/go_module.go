package main

import (
	"expressioni.sta/ast"
	"expressioni.sta/focus"
	"fmt"
	"runtime/debug"
	"syscall/js"
)

type vue struct {
	ref         js.Value
	watch       js.Value
	computed    js.Value
	readonly    js.Value
	onUnmounted js.Value
	nextTick    js.Value

	// The ElementLayout.ts class.
	elementLayoutClass js.Value
}

// expressorContext contains mutable state for the Expressor Gue Component's descendants.
type expressorContext struct {
	focus *focus.Focus

	// documentKeydown is fired whenever a keydown event occurs on the webpage's document.
	documentKeydown JsEvent
}

// attributeContext contains mutable state for an Attribute Gue Component's descendants.
type attributeContext struct {
	nodeIdToNode     map[string]ast.Node
	layout           ElementLayout
	expressorContext expressorContext
}

func bootstrapGoModule() {
	ast.SetupPrimitiveFunctions()
	ast.SetupProtoOrganisms()
	setupPixiSetters()
	goModule := makeEmptyObject()

	rootOrgs := make([]*ast.Organism, 0)
	goModule.Set("setupExpressor", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ref := args[0]
		watch := args[1]
		computed := args[2]
		vue := vue{ref, watch, computed, args[3], args[4], args[5], args[6]}
		return setupExpressor(vue, &rootOrgs)
	}).Value)

	var pool *pixiPool = nil
	goModule.Set("eval", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		circlePool := args[0]
		if pool == nil {
			pool = newPixiPool(circlePool)
		}
		outputs := eval(rootOrgs)
		writeToPixi(outputs, pool)
		return js.Undefined()
	}))

	js.Global().Set("GoModule", goModule)
}

func setupOrganism(organism *ast.Organism, vue vue, context expressorContext) interface{} {
	attributes := vue.ref.Invoke()
	attributes.Set("value", getAttributesArray(organism, vue, context))
	organism.OnAttributesChanged.On(func() {
		attributes.Set("value", getAttributesArray(organism, vue, context))
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

// getOrganismsArray returns [{ id, setupFunc }]
func getOrganismsArray(organisms []*ast.Organism, vue vue, context expressorContext) js.Value {
	arr := makeEmptyArray()
	for i, el := range organisms {
		el := el
		childValue := makeEmptyObject()
		childValue.Set("id", el.GetId())
		childValue.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return setupOrganism(el, vue, context)
		}))
		arr.SetIndex(i, childValue)
	}
	return arr
}

func getAttributesArray(organism *ast.Organism, vue vue, context expressorContext) js.Value {
	array := makeEmptyArray()
	for i, element := range organism.Attributes() {
		element := element
		childValue := makeEmptyObject()
		childValue.Set("id", element.GetId())
		childValue.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return setupAttribute(element, vue, context)
		}))
		array.SetIndex(i, childValue)
	}
	return array
}

func setupAttribute(a *ast.Attribute, vue vue, context expressorContext) js.Value {
	ret := makeEmptyObject()
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

	nodeTreeWidthRef := vue.ref.Invoke()
	nodeTreeWidthRef.Set("value", 0)
	nodeTreeHeightRef := vue.ref.Invoke()
	nodeTreeHeightRef.Set("value", 0)

	ret.Set("id", a.GetId())
	ret.Set("rootNodeId", rootNodeIdRef)
	ret.Set("name", a.GetName())
	ret.Set("rootNodeSetupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		defer func() {
			// See the section "Note on js.Func" in the README.
			if err := recover(); err != nil {
				println(fmt.Sprint(err))
				debug.PrintStack()
			}
		}()
		return setupNode(a.RootNode, vue, attributeContext{
			nodeIdToNode:     nodeIdToNode,
			layout:           layout,
			expressorContext: context,
		})
	}))

	// nodeTreeWidth: string | The CSS value for the width of the entire Node tree.
	ret.Set("nodeTreeWidth", nodeTreeWidthRef)

	// nodeTreeHidth: string | The CSS value for the height of the entire Node tree.
	ret.Set("nodeTreeHeight", nodeTreeHeightRef)

	offRootNodeChanged := a.OnRootNodeChanged.On(func() {
		rootNodeIdRef.Set("value", a.RootNode.GetId())
	})
	vue.onUnmounted.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		offRootNodeChanged()
		return nil
	}))

	layout.getOnCalculated().Call("subscribe", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		output := args[0]
		nodeTreeWidthRef.Set("value", fmt.Sprintf("%fpx", output.Get("totalWidth").Float()))
		nodeTreeHeightRef.Set("value", fmt.Sprintf("%fpx", output.Get("totalHeight").Float()))
		return nil
	}))

	return ret
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
