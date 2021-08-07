package ast

import "expressionista/common"

type Function struct {
	common.Name
	rootNode   Node
	parameters []*FunctionParameter
}

func (f *Function) addParameter(s string) *FunctionParameter {
	parameter := &FunctionParameter{}
	parameter.SetName(s)
	parameter.function = f
	f.parameters = append(f.parameters, parameter)
	return parameter
}

func (f Function) setRootNode(node Node) {
	f.rootNode = node
}

func NewFunction(s string) *Function {
	return &Function{
		Name:       common.Name{Name: s},
		rootNode:   nil,
		parameters: make([]*FunctionParameter, 0),
	}
}
