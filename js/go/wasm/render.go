package wasm

import (
	"expressionista/ast"
	"strings"
	"syscall/js"
)

func render(rootOrganism *ast.Organism, circlePool js.Value, circles js.Value) {
	organismOutput := rootOrganism.Eval()
	for _, circle := range jsArrayToSlice(circles) {
		circle.Set("visible", false)
	}

	circle := circlePool.Call("use")
	defer func() { circlePool.Call("recycle", circle) }()
	circle.Set("visible", true)

	for protoAttribute, value := range organismOutput.ValueByProtoAttribute {
		if protoAttribute.CustomPixiSetter == nil {
			circle.Set(strings.ToLower(protoAttribute.GetName()), value)
		} else {
			protoAttribute.CustomPixiSetter(circle, value)
		}
	}

	//js.Global().Get("console").Call("log", circle)
}
