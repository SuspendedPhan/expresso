package main

import (
	"expressioni.sta/ast"
	"github.com/stretchr/testify/assert"
	"syscall/js"
	"testing"
)

func TestRenderOrganism(t *testing.T) {
	organism := ast.NewOrganism()
	protoCircle := ast.GetProtoCircle()
	organism.AddIntrinsicAttribute(protoCircle.X)
	organism.IntrinsicAttributeByProtoAttribute[protoCircle.X].SetRootNode(ast.NewNumberNode(10))
	orgs := make([]*ast.Organism, 0)
	orgs = append(orgs, organism)

	circle := makeEmptyObject()
	pool := makeEmptyObject()
	pool.Set("use", js.FuncOf(func(this js.Value, args []js.Value) any {
		return circle
	}))
	pool.Set("recycleAll", js.FuncOf(func(this js.Value, args []js.Value) any {
		return nil
	}))

	outputs := eval(orgs)
	writeToPixi(outputs, newPixiPool(pool))
	assert.Equal(t, 10, circle.Get("x").Int())
}
