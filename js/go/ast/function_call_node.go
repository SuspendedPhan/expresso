package ast

type FunctionCallNode struct {
	function            Function
	argumentByParameter map[*Parameter]Node
}

func (f FunctionCallNode) eval() float32 {
	panic("implement me")
}

func (f FunctionCallNode) replaceChild(old Node, new Node) {
	panic("implement me")
}

func (f FunctionCallNode) getParentNode() Node {
	panic("implement me")
}

func (f FunctionCallNode) getName() string {
	panic("implement me")
}

func (f FunctionCallNode) setParentNode(n Node) {
	panic("implement me")
}

func (f FunctionCallNode) setArgumentByIndex(index int, argument Node) {
	parameter := f.function.parameters[index]
	f.argumentByParameter[parameter] = argument
}
