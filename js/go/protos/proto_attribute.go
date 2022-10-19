package protos

import (
	"expressioni.sta/common"
	"github.com/google/uuid"
)

var ClonesAttribute = NewProtoAttribute("Clones")

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
