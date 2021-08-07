package ast

import "expressionista/common"

type Function struct {
	common.Name
	rootNode   Node
	parameters []*Parameter
}

func (f *Function) addParameter(s string) Parameter {
	parameter := Parameter{}
	parameter.SetName(s)
	f.parameters = append(f.parameters, &parameter)
	return parameter
}

func (f Function) setRootNode(node Node) {
	f.rootNode = node
}

func NewFunction(s string) *Function {
	return &Function{
		Name:       common.Name{Name: s},
		rootNode:   nil,
		parameters: make([]*Parameter, 0),
	}
}
