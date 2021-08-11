package ast

import (
	"expressionista/common"
	"github.com/google/uuid"
)

type NodeBase struct {
	common.Id
	ParentNode      Node `hydration:"ref"`
	onChildReplaced chan struct{}
	Attribute       *Attribute `hydration:"ref"`
}

func NewNodeBase() NodeBase {
	base := NodeBase{}
	base.onChildReplaced = make(chan struct{})
	base.SetId(uuid.NewString())
	return base
}

func (n2 *NodeBase) GetOnChildReplaced() <-chan struct{} {
	return n2.onChildReplaced
}

func (n2 *NodeBase) SetParentNode(n Node) {
	n2.ParentNode = n
}

func (n2 NodeBase) GetParentNode() Node {
	return n2.ParentNode
}

func (n2 *NodeBase) SetAttribute(a *Attribute) {
	n2.Attribute = a
}

func (n2 *NodeBase) GetAttribute() *Attribute {
	return n2.Attribute
}
