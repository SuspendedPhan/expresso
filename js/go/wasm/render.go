package wasm

import (
	"expressionista/ast"
	"strings"
	"syscall/js"
)

var pixiSetters = make(map[*ast.ProtoAttribute]func(pixiObject js.Value, value ast.Float))

func setupPixiSetters() {
	pixiSetters[ast.ProtoCircle.Radius] = func(pixiObject js.Value, value ast.Float) {
		pixiObject.Get("scale").Set("x", value)
		pixiObject.Get("scale").Set("y", value)
	}
}

func render(rootOrganism *ast.Organism, circlePool js.Value, circles js.Value) {
	organismOutput := rootOrganism.Eval()
	for _, circle := range jsArrayToSlice(circles) {
		circle.Set("visible", false)
	}

	circle := circlePool.Call("use")
	defer func() { circlePool.Call("recycle", circle) }()
	circle.Set("visible", true)

	for protoAttribute, value := range organismOutput.ValueByProtoAttribute {
		if pixiSetter, ok := pixiSetters[protoAttribute]; ok {
			pixiSetter(circle, value)
		} else {
			circle.Set(strings.ToLower(protoAttribute.GetName()), value)
		}
	}

	//js.Global().Get("console").Call("log", circle)
}
