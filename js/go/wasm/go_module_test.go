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

func TestFunc(t *testing.T) {
	t.SkipNow()
	of := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return nil
	})
	of.Invoke()
	fmt.Println("hi")
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
	//t.SkipNow()
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
	gue.Call("onNodeChoiceQueryInput", "20")
	assert.Equal(t, "20", gue.Get("nodeChoiceQuery").Get("value").String())

	nodeChoice := gue.Get("nodeChoices").Get("value").Index(0)
	assert.Equal(t, "20", nodeChoice.Get("text").String())

	nodeChoice.Call("commitFunc")
	assert.Equal(t, "20.00", attribute.RootNode.GetText())

	gue = setupNode(attribute.RootNode, mockVue())
	gue.Call("onNodeChoiceQueryInput", "30")
	nodeChoice = gue.Get("nodeChoices").Get("value").Index(0)
	nodeChoice.Call("commitFunc")
	assert.Equal(t, "30.00", attribute.RootNode.GetText())
}

func mockVue() vue {
	refFunc := js.ValueOf(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return makeEmptyObject()
	}))
	return vue{
		ref:      refFunc,
		watch:    js.Value{},
		computed: js.Value{},
	}
}
