package ast

import (
	"expressionista/common"
	"github.com/google/uuid"
)

type ExternalAttribute struct {
	common.Id
	common.Name
}

func NewExternalAttribute(name string) *ExternalAttribute {
	return &ExternalAttribute{
		Id:   common.Id{Id: uuid.NewString()},
		Name: common.Name{Name: name},
	}
}
