package ast

import (
	"fmt"
)

type Node interface {
	Eval() Float
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
	fmt.Printf("%+v\n", old)
	if parentNode == nil {
		old.GetAttribute().setRootNode(new)
	} else {
		parentNode.ReplaceChild(old, new)
	}
}
