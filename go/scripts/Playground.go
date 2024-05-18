package main

import (
	"expressioni.sta/ast"
	"github.com/davecgh/go-spew/spew"
	"reflect"
)

func main() {
	n := ast.NodeBase{}
	f, _ := reflect.TypeOf(n).FieldByName("ParentNode")
	println(f.Type.String())
	qq := reflect.ValueOf((*interface{})(nil))
	spew.Dump(qq.Interface())
}
