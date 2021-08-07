package ast

import "syscall/js"

type AttributeOutput struct {
	proto *ProtoAttribute
	value Float
}

type OrganismOutput struct {
	ValueByProtoAttribute map[*ProtoAttribute]Float
}

var ProtoCircle *Circle = nil

func SetupProtoOrganisms() {
	ProtoCircle = &Circle{
		X: &ProtoAttribute{
			Id:               Id{Id: "3b4ce0e4-8e29-4cbd-a00e-ff437b4af3b7"},
			Name:             Name{Name: "X"},
			CustomPixiSetter: nil,
		},
		Y: &ProtoAttribute{
			Id:               Id{Id: "9c09608a-6c14-40d9-85ff-5d96c4d4d7aa"},
			Name:             Name{Name: "Y"},
			CustomPixiSetter: nil,
		},
		Radius: &ProtoAttribute{
			Id:   Id{Id: "328e5b90-4370-4934-b899-6cc3d30ba368"},
			Name: Name{Name: "Radius"},
			CustomPixiSetter: func(pixi js.Value, value Float) {
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
