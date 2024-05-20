package ast

import (
	"expressioni.sta/common"
)

type Function struct {
	common.Name
	common.Id
	rootNode   Node
	parameters []*FunctionParameter
}

func (f *Function) GetParameters() []*FunctionParameter {
	return f.parameters
}

func (f *Function) AddParameter(s string) *FunctionParameter {
	parameter := &FunctionParameter{}
	parameter.SetName(s)
	parameter.function = f
	f.parameters = append(f.parameters, parameter)
	return parameter
}

func (f *Function) setRootNode(node Node) {
	f.rootNode = node
}

func NewFunction(s string) *Function {
	return &Function{
		Name:       common.Name{Name: s},
		Id:         common.GenerateId(),
		rootNode:   nil,
		parameters: make([]*FunctionParameter, 0),
	}
}
