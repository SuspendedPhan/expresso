package ast

type Node interface {
	Eval(evalContext *EvalContext) Float
	ReplaceChild(old Node, new Node)
	GetParentNode() Node
	SetParentNode(n Node)
	GetId() string
	SetAttribute(a *Attribute)
	GetAttribute() *Attribute
	GetText() string
	GetChildren() []Node

	// GetChildrenChanged returns a Signal which fires when this Node's list of children are changed.
	// This fires only for the immediate children.
	GetChildrenChanged() *Signal
}

func Replace(old Node, new Node) {
	parentNode := old.GetParentNode()
	if parentNode == nil {
		old.GetAttribute().SetRootNode(new)
	} else {
		parentNode.ReplaceChild(old, new)
	}
}
