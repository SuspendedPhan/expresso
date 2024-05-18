package ast

type ParameterNode struct {
	NodeBase
	parameter *FunctionParameter
	function  Function
}

func (p ParameterNode) Eval(ctx *EvalContext) Value {
	return ctx.argumentValueByParameter[p.parameter]
}

func (p ParameterNode) ReplaceChild(old Node, new Node) {
	panic("implement me")
}

func (p ParameterNode) GetText() string {
	panic("implement me")
}

func (p ParameterNode) GetChildren() []Node {
	panic("implement me")
}

func NewParameterNode(parameter *FunctionParameter) *ParameterNode {
	return &ParameterNode{NodeBase: NewNodeBase(), parameter: parameter}
}
