package ast

import (
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

func NewOrganismOutput() *OrganismOutput {
	return &OrganismOutput{make([]*CloneOutput, 0)}
}

func NewCloneOutput() *CloneOutput {
	return &CloneOutput{
		ValueByProtoAttribute: make(map[*protos.ProtoAttribute]Float),
		SuborganismOutputs:    make([]*OrganismOutput, 0),
	}
}
