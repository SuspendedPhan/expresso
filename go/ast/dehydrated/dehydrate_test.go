package dehydrated

import (
	"testing"

	"expressioni.sta/ast"
	"expressioni.sta/common"
)

func TestDehydrateAttribute(t *testing.T) {
	attr := ast.Attribute{
		RootNode: nil,
		Name:     common.Name{Name: "foo"},
		Id:       common.Id{Id: "bar"},
	}
	DehydrateAttribute(attr)
}
