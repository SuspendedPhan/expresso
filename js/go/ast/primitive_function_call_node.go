package ast

import (
	"expressionista/common"
	"github.com/google/uuid"
)

type PrimitiveFunctionCallNode struct {
	NodeBase
	function            *PrimitiveFunction
	argumentByParameter map[*PrimitiveFunctionParameter]Node
}

func (p PrimitiveFunctionCallNode) GetText() string {
	return p.function.GetName()
}

func (p PrimitiveFunctionCallNode) Eval(evalContext *EvalContext) Float {
	common.Assert(len(p.argumentByParameter) == len(p.function.parameters))

	args := make([]Float, 0)
	for _, parameter := range p.function.parameters {
		arg := p.argumentByParameter[parameter].Eval(evalContext)
		args = append(args, arg)
	}
	return p.function.evalFunctor(args)
}

func (p *PrimitiveFunctionCallNode) ReplaceChild(old Node, new Node) {
	println("replace child")
	for parameter, node := range p.argumentByParameter {
		if node == old {
			p.SetArgument(parameter, new)
			return
		}
	}
	common.Assert(false)
}

func (p *PrimitiveFunctionCallNode) SetArgument(parameter *PrimitiveFunctionParameter, node Node) {
	p.argumentByParameter[parameter] = node
	node.SetParentNode(p)
	go func() {
		p.onChildReplaced <- struct{}{}
	}()
}

func (n2 PrimitiveFunctionCallNode) GetChildren() []Node {
	children := make([]Node, 0)
	for _, parameter := range n2.function.parameters {
		children = append(children, n2.argumentByParameter[parameter])
	}
	return children
}

func (p *PrimitiveFunctionCallNode) SetArgumentByIndex(i int, node Node) {
	parameter := p.function.parameters[i]
	p.SetArgument(parameter, node)
}

func NewPrimitiveFunctionCallNode(function *PrimitiveFunction) *PrimitiveFunctionCallNode {
	node := PrimitiveFunctionCallNode{
		function:            function,
		argumentByParameter: map[*PrimitiveFunctionParameter]Node{},
		NodeBase:            NewNodeBase(),
	}
	for _, parameter := range function.parameters {
		numberNode := NewNumberNode(0)
		node.SetArgument(parameter, numberNode)
	}
	node.SetId(uuid.NewString())
	return &node
}
