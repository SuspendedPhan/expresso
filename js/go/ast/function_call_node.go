package ast

type FunctionCallNode struct {
	NodeBase
	function            *Function
	argumentByParameter map[*Parameter]Node
}

func (f FunctionCallNode) GetText() string {
	panic("implement me")
}

func (f FunctionCallNode) GetChildren() []Node {
	panic("implement me")
}

func (f FunctionCallNode) Eval() float32 {
	panic("implement me")
}

func (f FunctionCallNode) ReplaceChild(old Node, new Node) {
	panic("implement me")
}

func (f FunctionCallNode) setArgumentByIndex(index int, argument Node) {
	parameter := f.function.parameters[index]
	f.argumentByParameter[parameter] = argument
}

func NewFunctionCallNode(function *Function) *FunctionCallNode {
	return &FunctionCallNode{
		function:            function,
		argumentByParameter: make(map[*Parameter]Node),
	}
}
