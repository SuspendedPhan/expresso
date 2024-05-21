package protos

import (
	"expressioni.sta/common"
)

var ClonesAttribute = NewProtoAttribute("1ad93358-1a00-4aad-86dd-4be8c7de460b", "Clones")
var protoAttributeById = map[string]*ProtoAttribute{}

// ProtoAttribute is a prototype for intrinsic attributes. In other words, intrinsic attributes are instances of
// proto attributes. For example, all circles have an attribute called Radius. There is a single proto attribute for
// Radius, and all circle instances have their own Radius intrinsic attribute which points to this proto attribute.
type ProtoAttribute struct {
	common.Id
	common.Name
}

func NewProtoAttribute(id string, name string) *ProtoAttribute {
	protoAttribute := &ProtoAttribute{
		Id:   common.Id{Id: id},
		Name: common.Name{Name: name},
	}
	protoAttributeById[id] = protoAttribute
	return protoAttribute
}

func GetProtoAttributeById(id string) *ProtoAttribute {
	return protoAttributeById[id]
}
