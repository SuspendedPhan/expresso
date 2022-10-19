package ast

import (
	"expressioni.sta/common"
	"expressioni.sta/protos"
)

type AttributeOutput struct {
	proto *protos.ProtoAttribute
	value Float
}

type CloneOutput struct {
	ValueByProtoAttribute map[*protos.ProtoAttribute]Float
	SuborganismOutputs    []*OrganismOutput
}

type OrganismOutput struct {
	CloneOutputs []*CloneOutput
}

var ProtoCircle *Circle = nil

func SetupProtoOrganisms() {
	ProtoCircle = &Circle{
		X: &protos.ProtoAttribute{
			Id:   common.Id{Id: "3b4ce0e4-8e29-4cbd-a00e-ff437b4af3b7"},
			Name: common.Name{Name: "X"},
		},
		Y: &protos.ProtoAttribute{
			Id:   common.Id{Id: "9c09608a-6c14-40d9-85ff-5d96c4d4d7aa"},
			Name: common.Name{Name: "Y"},
		},
		Radius: &protos.ProtoAttribute{
			Id:   common.Id{Id: "328e5b90-4370-4934-b899-6cc3d30ba368"},
			Name: common.Name{Name: "Radius"},
		},
	}
}

type Circle struct {
	X      *protos.ProtoAttribute
	Y      *protos.ProtoAttribute
	Radius *protos.ProtoAttribute
}

func NewOrganismOutput() *OrganismOutput {
	return &OrganismOutput{make([]*CloneOutput, 0)}
}

func NewCloneOutput() *CloneOutput {
	return &CloneOutput{
		ValueByProtoAttribute: make(map[*protos.ProtoAttribute]Float),
		SuborganismOutputs:    make([]*OrganismOutput, 0),
	}
}
