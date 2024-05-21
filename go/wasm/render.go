package main

import (
	"strings"
	"syscall/js"

	"expressioni.sta/ast"
	"expressioni.sta/protos"
)

var pixiSetters = make(map[*protos.ProtoAttribute]func(pixiObject js.Value, value ast.Float))

func setupPixiSetters() {
	pixiSetters[protos.ProtoCircle.GetProtoAttributeByName("Radius")] = func(pixiObject js.Value, value ast.Float) {
		pixiObject.Get("scale").Set("x", value)
		pixiObject.Get("scale").Set("y", value)
	}
}

// eval evaluates the given root organisms.
func eval(rootOrgs []*ast.Organism) []ast.OrganismOutput {
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
				circle.Set(strings.ToLower(protoAttribute.GetName()), value)
			}
		}
	}
}

// pixiTest is a useful visual test.
func pixiTest(pool *pixiPool) {
	circle := pool.use()
	circle.Set("visible", true)
	circle.Set("x", 100)
	circle.Set("y", 100)
	circle.Get("scale").Set("x", 200)
	circle.Get("scale").Set("y", 200)
}
