package ast

type Node interface {
	Eval(evalContext *EvalContext) Float
	ReplaceChild(old Node, new Node)
	GetParentNode() Node
	SetParentNode(n Node)
	GetId() string
	GetOnChildReplaced() <-chan struct{}
	SetAttribute(a *Attribute)
	GetAttribute() *Attribute
	GetText() string
	GetChildren() []Node
}

func Replace(old Node, new Node) {
	parentNode := old.GetParentNode()
	if parentNode == nil {
		old.GetAttribute().SetRootNode(new)
	} else {
		parentNode.ReplaceChild(old, new)
	}
}
