package ast

type FunctionCallNode struct {
	NodeBase
	function            *Function
	argumentByParameter map[*FunctionParameter]Node
}

func (f FunctionCallNode) GetText() string {
	panic("implement me")
}

func (f FunctionCallNode) GetChildren() []Node {
	panic("implement me")
}

func (f FunctionCallNode) Eval(evalContext *EvalContext) Float {
	for parameter, argumentNode := range f.argumentByParameter {
		evalContext.argumentValueByParameter[parameter] = argumentNode.Eval(evalContext)
	}

	answer := f.function.rootNode.Eval(evalContext)

	for parameter := range f.argumentByParameter {
		delete(evalContext.argumentValueByParameter, parameter)
	}

	return answer
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
		argumentByParameter: make(map[*FunctionParameter]Node),
	}
}
