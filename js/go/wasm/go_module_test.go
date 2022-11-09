package main

import (
	"expressioni.sta/ast"
	"fmt"
	"github.com/stretchr/testify/assert"
	"syscall/js"
	"testing"
)

func TestNewAttribute(t *testing.T) {
	t.SkipNow()
	attribute := ast.NewAttribute()
	attribute.SetRootNode(ast.NewNumberNode(10))
	setupAttribute(attribute, mockVue())
}

// Calls to fmt.Print hang inside Funcs.
func TestPrintInsideInvoke(t *testing.T) {
	t.SkipNow()

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
	expressor := setupExpressor(mockVue())
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
	gue := setupOrganism(org, mockVue()).(js.Value)
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
	gue := setupAttribute(attribute, mockVue())
	setupObject := gue.Call("rootNodeSetupFunc")
	nodeText := setupObject.Get("text").String()
	assert.Equal(t, "10.00", nodeText)
}

func TestNodeChoices(t *testing.T) {
	attribute := ast.NewAttribute()
	node := ast.NewNumberNode(10)
	node.SetAttribute(attribute)
	gue := setupNode(node, mockVue())
	gue.Call("onNodeChoiceQueryInput", makeInputEvent("20"))
	assert.Equal(t, "20", gue.Get("nodeChoiceQuery").Get("value").String())

	nodeChoice := gue.Get("nodeChoices").Get("value").Index(0)
	assert.Equal(t, "20", nodeChoice.Get("text").String())

	nodeChoice.Call("commitFunc")
	assert.Equal(t, "20.00", attribute.RootNode.GetText())

	gue = setupNode(attribute.RootNode, mockVue())
	gue.Call("onNodeChoiceQueryInput", makeInputEvent("30"))
	nodeChoice = gue.Get("nodeChoices").Get("value").Index(0)
	nodeChoice.Call("commitFunc")
	assert.Equal(t, "30.00", attribute.RootNode.GetText())

	// Test 0.00 + 0.00
	gue = setupNode(attribute.RootNode, mockVue())
	gue.Call("onNodeChoiceQueryInput", makeInputEvent("+"))
	nodeChoice = gue.Get("nodeChoices").Get("value").Index(0)
	assert.Equal(t, "+", nodeChoice.Get("text").String())
	nodeChoice.Call("commitFunc")
	assert.Equal(t, "+", attribute.RootNode.GetText())

	gue = setupNode(attribute.RootNode, mockVue())
	assert.Equal(t, 2, gue.Get("children").Get("value").Length())
	gueA := gue.Get("children").Get("value").Index(0).Call("setupFunc")
	gueB := gue.Get("children").Get("value").Index(1).Call("setupFunc")
	assert.Equal(t, "0.00", gueA.Get("text").String())
	assert.Equal(t, "0.00", gueB.Get("text").String())

	// Test (0.00 + 0.00) + 0.00
	gueA.Call("onNodeChoiceQueryInput", makeInputEvent("*"))
	nodeChoice = gueA.Get("nodeChoices").Get("value").Index(0)
	assert.Equal(t, "*", nodeChoice.Get("text").String())
	nodeChoice.Call("commitFunc")
	//gue = setupNode(attribute.RootNode, mockVue())
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
	gueAttr := setupAttribute(attr, mockVue())
	assert.Equal(t, nodeA.GetId(), gueAttr.Get("rootNodeId").Get("value").String())
	attr.SetRootNode(nodeB)
	assert.Equal(t, nodeB.GetId(), gueAttr.Get("rootNodeId").Get("value").String())
}

func makeInputEvent(inputValue string) js.Value {
	arg := makeEmptyObject()
	arg.Set("target", makeEmptyObject())
	arg.Get("target").Set("value", inputValue)
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
	return vue{
		ref:         refFunc,
		watch:       js.Value{},
		computed:    js.Value{},
		readonly:    readonlyFunc,
		onUnmounted: onUnmountedFunc,
	}
}
