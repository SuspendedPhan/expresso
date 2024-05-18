package protos

import (
	"expressioni.sta/common"
	"github.com/google/uuid"
)

var ClonesAttribute = NewProtoAttribute("Clones")

// ProtoAttribute is a prototype for intrinsic attributes. In other words, intrinsic attributes are instances of
// proto attributes. For example, all circles have an attribute called Radius. There is a single proto attribute for
// Radius, and all circle instances have their own Radius intrinsic attribute which points to this proto attribute.
type ProtoAttribute struct {
	common.Id
	common.Name
}

func NewProtoAttribute(s string) *ProtoAttribute {
	return &ProtoAttribute{
		Id:   common.Id{Id: uuid.NewString()},
		Name: common.Name{Name: s},
	}
}
