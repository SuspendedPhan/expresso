package main

import (
	"expressioni.sta/ast"
	"expressioni.sta/focus"
	"fmt"
	"github.com/stretchr/testify/assert"
	"syscall/js"
	"testing"
)

func TestNewAttribute(t *testing.T) {
	t.SkipNow()
	attribute := ast.NewAttribute()
	attribute.SetRootNode(ast.NewNumberNode(10))
	setupAttribute(attribute, mockVue(), mockExpressorContext())
}

// Calls to fmt.Print hang inside Funcs.
// If you need to get the stacktrace for a setupFunc in a test, call it directly instead of calling js.Value.Call("setupFunc")
// Could try upgrading from 1.19.2 to 1.19.4? Would need to rebuild the Docker image.
func TestPrintInsideInvoke(t *testing.T) {
	t.SkipNow()

	js.FuncOf(func(this js.Value, args []js.Value) any {
		go func() {
			fmt.Println("this won't hang")
		}()
		return nil
	}).Invoke()

	fmt.Println("this will not hang")
	of := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		println("this won't hang either")
		fmt.Println("this will hang now")
		return nil
	})
	of.Invoke()
}

func TestSimple(t *testing.T) {
	t.SkipNow()
	orgs := make([]*ast.Organism, 0)
	expressor := setupExpressor(mockVue(), &orgs)
	length := expressor.Get("rootOrganisms").Get("value").Get("length").Int()
	assert.Equal(t, 0, length)

	expressor.Get("addOrganism").Invoke()
	length = expressor.Get("rootOrganisms").Get("value").Get("length").Int()
	assert.Equal(t, 1, length)

	expressor.Get("addOrganism").Invoke()
	length = expressor.Get("rootOrganisms").Get("value").Get("length").Int()
	assert.Equal(t, 2, length)

	name0 := expressor.Get("rootOrganisms").Get("value").Index(0).Call("setupFunc").Get("name").String()
	name1 := expressor.Get("rootOrganisms").Get("value").Index(1).Call("setupFunc").Get("name").String()
	assert.Equal(t, "organism0", name0)
	assert.Equal(t, "organism1", name1)
}

func TestOrganism(t *testing.T) {
	org := ast.NewOrganism()
	gue := setupOrganism(org, mockVue(), mockExpressorContext()).(js.Value)
	attrs := gue.Get("attributes")
	assert.Equal(t, 0, attrs.Get("value").Get("length").Int())
	gue.Call("addAttribute")
	assert.Equal(t, 1, attrs.Get("value").Get("length").Int())
	gue.Call("addAttribute")
	assert.Equal(t, 2, attrs.Get("value").Get("length").Int())
	name0 := gue.Get("attributes").Get("value").Index(0).Call("setupFunc").Get("name").String()
	name1 := gue.Get("attributes").Get("value").Index(1).Call("setupFunc").Get("name").String()
	assert.Equal(t, "attrib0", name0)
	assert.Equal(t, "attrib1", name1)
}

func TestNodes(t *testing.T) {
	attribute := ast.NewAttribute()
	attribute.SetRootNode(ast.NewNumberNode(10))
	gue := setupAttribute(attribute, mockVue(), mockExpressorContext())
	setupObject := gue.Call("rootNodeSetupFunc")
	nodeText := setupObject.Get("text").String()
	assert.Equal(t, "10.00", nodeText)
}

func TestNodeChoices(t *testing.T) {
	attribute := ast.NewAttribute()
	node := ast.NewNumberNode(10)
	node.SetAttribute(attribute)
	gue := setupNode(node, mockVue(), mockAttributeContext())
	gue.Call("nodePickerOnQueryInput", makeInputEvent("20"))
	assert.Equal(t, "20", gue.Get("nodePickerQuery").Get("value").String())

	nodeChoice := gue.Get("nodePickerChoices").Get("value").Index(0)
	assert.Equal(t, "20", nodeChoice.Get("text").String())

	nodeChoice.Call("commitFunc", makeClickEvent())
	assert.Equal(t, "20.00", attribute.RootNode.GetText())

	gue = setupNode(attribute.RootNode, mockVue(), mockAttributeContext())
	gue.Call("nodePickerOnQueryInput", makeInputEvent("30"))
	nodeChoice = gue.Get("nodePickerChoices").Get("value").Index(0)
	nodeChoice.Call("commitFunc", makeClickEvent())
	assert.Equal(t, "30.00", attribute.RootNode.GetText())

	// Test 0.00 + 0.00
	gue = setupNode(attribute.RootNode, mockVue(), mockAttributeContext())
	gue.Call("nodePickerOnQueryInput", makeInputEvent("+"))
	nodeChoice = gue.Get("nodePickerChoices").Get("value").Index(0)
	assert.Equal(t, "+", nodeChoice.Get("text").String())
	nodeChoice.Call("commitFunc", makeClickEvent())
	assert.Equal(t, "+", attribute.RootNode.GetText())

	gue = setupNode(attribute.RootNode, mockVue(), mockAttributeContext())
	assert.Equal(t, 2, gue.Get("children").Get("value").Length())
	gueA := gue.Get("children").Get("value").Index(0).Call("setupFunc")
	gueB := gue.Get("children").Get("value").Index(1).Call("setupFunc")
	assert.Equal(t, "0.00", gueA.Get("text").String())
	assert.Equal(t, "0.00", gueB.Get("text").String())

	// Test (0.00 + 0.00) + 0.00
	gueA.Call("nodePickerOnQueryInput", makeInputEvent("*"))
	nodeChoice = gueA.Get("nodePickerChoices").Get("value").Index(0)
	assert.Equal(t, "*", nodeChoice.Get("text").String())
	nodeChoice.Call("commitFunc", makeClickEvent())
	gueA = gue.Get("children").Get("value").Index(0).Call("setupFunc")
	assert.Equal(t, "*", gueA.Get("text").String())
	gueNested := gueA.Get("children").Get("value").Index(0).Call("setupFunc")
	assert.Equal(t, "0.00", gueNested.Get("text").String())
}

func TestAttrRootNodeIdRef(t *testing.T) {
	attr := ast.NewAttribute()
	nodeA := ast.NewNumberNode(10)
	nodeB := ast.NewNumberNode(20)
	attr.SetRootNode(nodeA)
	gueAttr := setupAttribute(attr, mockVue(), mockExpressorContext())
	assert.Equal(t, nodeA.GetId(), gueAttr.Get("rootNodeId").Get("value").String())
	attr.SetRootNode(nodeB)
	assert.Equal(t, nodeB.GetId(), gueAttr.Get("rootNodeId").Get("value").String())
}

// TestNodeElementLayout tests that setupNode() makes the correct calls to ElementLayout.
func TestNodeElementLayout(t *testing.T) {
	nodeIdToPositionCallback := make(map[string]js.Value)
	elementKeyToElement := make(map[string]js.Value)
	layout := mockElementLayout()
	layout.elementLayout.Set("getLocalPositionObservable", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		nodeId := args[0].String()
		localPositionObservable := makeEmptyObject()
		localPositionObservable.Set("subscribe", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			callback := args[0]
			nodeIdToPositionCallback[nodeId] = callback
			return nil
		}))
		return localPositionObservable
	}))
	layout.elementLayout.Set("registerElement", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		element := args[0]
		elementKey := args[1].String()
		elementKeyToElement[elementKey] = element
		return nil
	}))
	context := mockAttributeContext()
	context.layout = layout
	node := ast.NewPrimitiveFunctionCallNode(ast.GetPrimitiveFunctions()["+"])
	gueNode := setupNode(node, mockVue(), context)
	position := makeEmptyObject()
	position.Set("left", 10)
	position.Set("top", 20)
	callback, found := nodeIdToPositionCallback[node.GetId()]
	assert.True(t, found)
	callback.Invoke(position)
	assert.Equal(t, 10, gueNode.Get("position").Get("value").Get("left").Int())
	assert.Equal(t, 20, gueNode.Get("position").Get("value").Get("top").Int())

	_, found = elementKeyToElement[node.GetId()]
	assert.True(t, found, "Should have called registerElement()")
}

// TestAttrContextNodeIdMap tests that setupNode() registers nodes with the attributeContext.
func TestAttrContextNodeIdMap(t *testing.T) {
	node := ast.NewPrimitiveFunctionCallNode(ast.GetPrimitiveFunctions()["+"])
	context := mockAttributeContext()
	gueNode := setupNode(node, mockVue(), context)
	gueNode.Get("children").Get("value").Index(0).Call("setupFunc")
	gueNode.Get("children").Get("value").Index(1).Call("setupFunc")
	assert.Len(t, context.nodeIdToNode, 3)
	_, found := context.nodeIdToNode[node.GetId()]
	assert.True(t, found)
	_, found = context.nodeIdToNode[node.GetChildren()[0].GetId()]
	assert.True(t, found)
	_, found = context.nodeIdToNode[node.GetChildren()[1].GetId()]
	assert.True(t, found)
}

// TestGetChildrenIds tests getChildrenIds().
func TestGetChildrenIds(t *testing.T) {
	nodeIdToNode := make(map[string]ast.Node)
	node := ast.NewPrimitiveFunctionCallNode(ast.GetPrimitiveFunctions()["+"])
	nodeIdToNode[node.GetId()] = node
	nodeIdToNode[node.GetChildren()[0].GetId()] = node.GetChildren()[0]
	nodeIdToNode[node.GetChildren()[1].GetId()] = node.GetChildren()[1]
	ids := getChildrenIds(node.GetId(), nodeIdToNode)
	assert.Equal(t, 2, ids.Length())
	assert.Equal(t, ids.Index(0).String(), node.GetChildren()[0].GetId())
	assert.Equal(t, ids.Index(1).String(), node.GetChildren()[1].GetId())
}

// TestAttrNodeTreeSize tests that setupAttribute() properly sets nodeTreeWidth and nodeTreeHeight.
func TestAttrNodeTreeSize(t *testing.T) {
	attr := ast.NewAttribute()
	attr.SetRootNode(ast.NewNumberNode(10))
	gueAttr := setupAttribute(attr, mockVue(), mockExpressorContext())
	assert.Equal(t, "100.000000px", gueAttr.Get("nodeTreeWidth").Get("value").String())
	assert.Equal(t, "200.000000px", gueAttr.Get("nodeTreeHeight").Get("value").String())
}

func makeInputEvent(inputValue string) js.Value {
	arg := makeEmptyObject()
	arg.Set("target", makeEmptyObject())
	arg.Get("target").Set("value", inputValue)
	arg.Set("stopPropagation", js.FuncOf(func(this js.Value, args []js.Value) any {
		return nil
	}))
	return arg
}

func makeClickEvent() js.Value {
	arg := makeEmptyObject()
	arg.Set("stopPropagation", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return nil
	}))
	return arg
}

func mockVue() vue {
	refFunc := js.ValueOf(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return makeEmptyObject()
	}))
	readonlyFunc := js.ValueOf(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return args[0]
	}))
	onUnmountedFunc := js.ValueOf(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return nil
	}))
	nextTickFunc := js.ValueOf(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		args[0].Invoke()
		return nil
	}))
	return vue{
		ref:                refFunc,
		watch:              js.Value{},
		computed:           js.Value{},
		readonly:           readonlyFunc,
		onUnmounted:        onUnmountedFunc,
		nextTick:           nextTickFunc,
		elementLayoutClass: getMockElementLayoutClass(),
	}
}

func mockAttributeContext() attributeContext {
	return attributeContext{
		nodeIdToNode:     make(map[string]ast.Node),
		layout:           mockElementLayout(),
		expressorContext: mockExpressorContext(),
	}
}

func mockExpressorContext() expressorContext {
	return expressorContext{focus: focus.NewFocus(), documentKeydown: NewJsEventDispatcher()}
}

func mockElementLayout() ElementLayout {
	return ElementLayout{elementLayout: getMockElementLayoutClass().New()}
}

// getMockElementLayoutClass returns a mock LayoutElement class.
func getMockElementLayoutClass() js.Value {
	return js.ValueOf(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		this.Set("getLocalPositionObservable", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			object := makeEmptyObject()
			object.Set("subscribe", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				return nil
			}))
			return object
		}))
		this.Set("registerElement", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return nil
		}))

		onCalculated := makeEmptyObject()
		onCalculated.Set("subscribe", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			callback := args[0]
			output := makeEmptyObject()
			output.Set("totalWidth", 100)
			output.Set("totalHeight", 200)
			callback.Invoke(output)
			return nil
		}))
		this.Set("onCalculated", onCalculated)

		this.Set("recalculate", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return nil
		}))
		return nil
	}))
}
