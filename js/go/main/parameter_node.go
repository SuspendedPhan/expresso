package main

type ParameterNode struct {
	parameter Parameter
}

func (p ParameterNode) eval() float32 {
	panic("implement me")
}

func (p ParameterNode) replaceChild(old Node, new Node) {
	panic("implement me")
}

func (p ParameterNode) getParentNode() Node {
	panic("implement me")
}

func (p ParameterNode) getName() string {
	panic("implement me")
}

func (p ParameterNode) setParentNode(n Node) {
	panic("implement me")
}
