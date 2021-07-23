package main

import "github.com/google/uuid"

type PrimitiveFunctionCallNode struct {
	NodeBase
	function            *PrimitiveFunction
	argumentByParameter map[*Parameter]Node
}

func (p PrimitiveFunctionCallNode) getText() string {
	return p.function.getName()
}

func (p PrimitiveFunctionCallNode) eval() float {
	assert(len(p.argumentByParameter) == len(p.function.parameters))

	args := make([]float, 0)
	for _, parameter := range p.function.parameters {
		arg := p.argumentByParameter[parameter].eval()
		args = append(args, arg)
	}
	return p.function.evalFunctor(args)
}

func (p *PrimitiveFunctionCallNode) replaceChild(old Node, new Node) {
	println("replace child")
	for parameter, node := range p.argumentByParameter {
		if node == old {
			p.setArgument(parameter, new)
			return
		}
	}
	assert(false)
}

func (p *PrimitiveFunctionCallNode) setArgument(parameter *Parameter, node Node) {
	p.argumentByParameter[parameter] = node
	node.setParentNode(p)
	go func() {
		p.onChildReplaced <- struct{}{}
	}()
}

func (n2 PrimitiveFunctionCallNode) getChildren() []Node {
	children := make([]Node, 0)
	for _, parameter := range n2.function.parameters {
		children = append(children, n2.argumentByParameter[parameter])
	}
	return children
}

func NewPrimitiveFunctionCallNode(function *PrimitiveFunction) *PrimitiveFunctionCallNode {
	node := PrimitiveFunctionCallNode{
		function:            function,
		argumentByParameter: map[*Parameter]Node{},
		NodeBase:            NewNodeBase(),
	}
	for _, parameter := range function.parameters {
		numberNode := NewNumberNode(0)
		node.setArgument(parameter, &numberNode)
	}
	node.setId(uuid.NewString())
	return &node
}
