package protos

import "expressioni.sta/common"

type ProtoOrganism struct {
	common.Id
	ProtoAttributes []*ProtoAttribute
}

func NewProtoOrganism(id string, protoAttributes ...*ProtoAttribute) *ProtoOrganism {
	return &ProtoOrganism{
		common.Id{Id: id},
		protoAttributes,
	}
}

func (po *ProtoOrganism) GetProtoAttributeByName(name string) *ProtoAttribute {
	for _, protoAttribute := range po.ProtoAttributes {
		if protoAttribute.GetName() == name {
			return protoAttribute
		}
	}
	return nil
}

var ProtoCircle = NewProtoOrganism(
	"43277729-53d5-47a7-a80c-69a30c79c0fa",
	NewProtoAttribute("ec211cbf-9173-4f8a-be43-01db9cd1b29a", "X"),
	NewProtoAttribute("e315d358-3240-435a-ba5f-65a1a0c877a1", "Y"),
	NewProtoAttribute("78e6f7e9-b32e-4217-98b3-b2010a6d089c", "Radius"),
)
