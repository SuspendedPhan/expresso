package main

import (
	"expressioni.sta/ast"
	"expressioni.sta/protos"
	"fmt"
	"strings"
	"syscall/js"
)

var pixiSetters = make(map[*protos.ProtoAttribute]func(pixiObject js.Value, value ast.Float))

func setupPixiSetters() {
	pixiSetters[ast.ProtoCircle.Radius] = func(pixiObject js.Value, value ast.Float) {
		println(fmt.Sprintf("Setting attr 'scale' to value '%v'", value))
		pixiObject.Get("scale").Set("x", value)
		pixiObject.Get("scale").Set("y", value)
	}
}

// eval evaluates the given root organisms.
func eval(rootOrgs []*ast.Organism) []ast.OrganismOutput {
	println("Begin eval")
	outputs := make([]ast.OrganismOutput, 0)
	context := ast.NewEvalContext()
	for _, org := range rootOrgs {
		outputs = append(outputs, *org.Eval(context))
	}
	return outputs
}

// writeToPixi copies the entire output data to the pixi scene graph.
func writeToPixi(rootOutputs []ast.OrganismOutput, pool *pixiPool) {
	pool.recycleAll()
	for _, output := range rootOutputs {
		writeOrganismToPixi(output, pool)
	}
}

// writeOrganismToPixi copies an organism's output data to the pixi scene graph.
func writeOrganismToPixi(organismOutput ast.OrganismOutput, pool *pixiPool) {
	for _, cloneOutput := range organismOutput.CloneOutputs {
		circle := pool.use()
		for protoAttribute, value := range cloneOutput.ValueByProtoAttribute {
			if pixiSetter, ok := pixiSetters[protoAttribute]; ok {
				pixiSetter(circle, value)
			} else {
				println(fmt.Sprintf("Setting attr '%v' to value '%v'", protoAttribute.GetName(), value))
				circle.Set(strings.ToLower(protoAttribute.GetName()), value)
			}
		}
		for _, output := range cloneOutput.SuborganismOutputs {
			writeOrganismToPixi(*output, pool)
		}
	}
}

// pixiTest is a useful visual test.
func pixiTest(pool *pixiPool) {
	pool.recycleAll()
	circle := pool.use()
	circle.Set("x", 100)
	circle.Set("y", 100)
	circle.Get("scale").Set("x", 50)
	circle.Get("scale").Set("y", 50)

	circle2 := pool.use()
	circle2.Set("x", 400)
	circle2.Set("y", 400)
	circle2.Get("scale").Set("x", 100)
	circle2.Get("scale").Set("y", 100)
}

func pixiTest2(pool *pixiPool) {
	rootOrgs := make([]*ast.Organism, 0)
	parent := ast.NewOrganism()
	protoRadius := ast.GetProtoCircle().Radius
	parent.AddIntrinsicAttribute(protoRadius)
	parent.AddIntrinsicAttribute(ast.GetProtoCircle().X)
	parent.IntrinsicAttributeByProtoAttribute[ast.GetProtoCircle().X].SetRootNode(ast.NewNumberNode(50))
	parent.IntrinsicAttributeByProtoAttribute[protoRadius].SetRootNode(ast.NewNumberNode(10))
	child := ast.NewOrganism()
	child.AddIntrinsicAttribute(protoRadius)
	child.IntrinsicAttributeByProtoAttribute[protoRadius].SetRootNode(ast.NewNumberNode(20))
	parent.AddSuborganism(child)
	rootOrgs = append(rootOrgs, parent)
	outputs := eval(rootOrgs)
	writeToPixi(outputs, pool)
}
