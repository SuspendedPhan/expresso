package main

import (
	"expressioni.sta/ast"
	"expressioni.sta/protos"
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

func TestEvalHasDescendantOutputs(t *testing.T) {
	rootOrgs := make([]*ast.Organism, 0)
	parent := ast.NewOrganism()
	protoRadius := ast.GetProtoCircle().Radius
	parent.AddIntrinsicAttribute(protoRadius)
	parent.IntrinsicAttributeByProtoAttribute[protoRadius].SetRootNode(ast.NewNumberNode(10))
	child := ast.NewOrganism()
	child.AddIntrinsicAttribute(protoRadius)
	child.IntrinsicAttributeByProtoAttribute[protoRadius].SetRootNode(ast.NewNumberNode(20))
	parent.AddSuborganism(child)
	rootOrgs = append(rootOrgs, parent)
	outputs := eval(rootOrgs)
	assert.Len(t, outputs, 1)
	assert.Len(t, outputs[0].CloneOutputs, 1)
	assert.Equal(t, ast.Float(10), outputs[0].CloneOutputs[0].ValueByProtoAttribute[protoRadius])

	assert.Len(t, outputs[0].CloneOutputs[0].SuborganismOutputs, 1)
	assert.Len(t, outputs[0].CloneOutputs[0].SuborganismOutputs[0].CloneOutputs, 1)
	assert.Equal(t, ast.Float(20), outputs[0].CloneOutputs[0].SuborganismOutputs[0].CloneOutputs[0].ValueByProtoAttribute[protoRadius])
}

func TestWriteToPixiChildOrganisms(t *testing.T) {
	outputs := make([]ast.OrganismOutput, 0)
	parent := ast.NewOrganismOutput()
	parentClone := ast.NewCloneOutput()
	parentClone.ValueByProtoAttribute[protos.ClonesAttribute] = 1
	parentClone.ValueByProtoAttribute[ast.GetProtoCircle().Radius] = 10
	child := ast.NewOrganismOutput()
	childClone := ast.NewCloneOutput()
	childClone.ValueByProtoAttribute[protos.ClonesAttribute] = 1
	childClone.ValueByProtoAttribute[ast.GetProtoCircle().Radius] = 20

	child.CloneOutputs = append(child.CloneOutputs, childClone)
	parentClone.SuborganismOutputs = append(parentClone.SuborganismOutputs, child)
	parent.CloneOutputs = append(parent.CloneOutputs, parentClone)

	outputs = append(outputs, *parent)
	circle := makeEmptyObject()
	pool := makeEmptyObject()
	pool.Set("use", js.FuncOf(func(this js.Value, args []js.Value) any {
		return circle
	}))
	pool.Set("recycleAll", js.FuncOf(func(this js.Value, args []js.Value) any {
		return nil
	}))
	writeToPixi(outputs, pool)
}
