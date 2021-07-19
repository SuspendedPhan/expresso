package main

type PrimitiveFunctionCallNode struct {
	function            *PrimitiveFunction
	argumentByParameter map[*Parameter]Node
}

func (p PrimitiveFunctionCallNode) eval() float32 {
	panic("implement me")
}

func (p *PrimitiveFunctionCallNode) replaceChild(old Node, new Node) {
	panic("implement me")
}

func (p PrimitiveFunctionCallNode) getParentNode() Node {
	panic("implement me")
}

func (p PrimitiveFunctionCallNode) getName() string {
	panic("implement me")
}

func (p *PrimitiveFunctionCallNode) setParentNode(n Node) {
	panic("implement me")
}

func (p *PrimitiveFunctionCallNode) setArgument(parameter *Parameter, node Node) {
	p.argumentByParameter[parameter] = node
}
