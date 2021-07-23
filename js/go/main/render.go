package main

import (
	"strings"
	"syscall/js"
)

var protoCircle *Circle = nil

func setupProtoOrganisms() {
	protoCircle = &Circle{
		X: &ProtoAttribute{
			Id:               Id{Id: "3b4ce0e4-8e29-4cbd-a00e-ff437b4af3b7"},
			Name:             Name{name: "X"},
			customPixiSetter: nil,
		},
		Y: &ProtoAttribute{
			Id:               Id{Id: "9c09608a-6c14-40d9-85ff-5d96c4d4d7aa"},
			Name:             Name{name: "Y"},
			customPixiSetter: nil,
		},
		Radius: &ProtoAttribute{
			Id:   Id{Id: "328e5b90-4370-4934-b899-6cc3d30ba368"},
			Name: Name{name: "Radius"},
			customPixiSetter: func(pixi js.Value, value float) {
				pixi.Get("scale").Set("x", value)
				pixi.Get("scale").Set("y", value)
			},
		},
	}
}

type Circle struct {
	X      *ProtoAttribute
	Y      *ProtoAttribute
	Radius *ProtoAttribute
}

type AttributeOutput struct {
	proto *ProtoAttribute
	value float
}

type OrganismOutput struct {
	ValueByProtoAttribute map[*ProtoAttribute]float
}

func render(rootOrganism *Organism, circlePool js.Value, circles js.Value) {
	organismOutput := rootOrganism.eval()
	for _, circle := range jsArrayToSlice(circles) {
		circle.Set("visible", false)
	}

	circle := circlePool.Call("use")
	defer func() { circlePool.Call("recycle", circle) }()
	circle.Set("visible", true)

	for protoAttribute, value := range organismOutput.ValueByProtoAttribute {
		if protoAttribute.customPixiSetter == nil {
			circle.Set(strings.ToLower(protoAttribute.name), value)
		} else {
			protoAttribute.customPixiSetter(circle, value)
		}
	}

	//js.Global().Get("console").Call("log", circle)
}
