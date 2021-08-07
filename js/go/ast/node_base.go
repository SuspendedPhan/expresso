package ast

import (
	"expressionista/common"
	"github.com/google/uuid"
)

type NodeBase struct {
	common.Id
	parentNode      Node
	onChildReplaced chan struct{}
	attribute       *Attribute
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
	n2.parentNode = n
}

func (n2 NodeBase) GetParentNode() Node {
	return n2.parentNode
}

func (n2 *NodeBase) SetAttribute(a *Attribute) {
	n2.attribute = a
}

func (n2 *NodeBase) GetAttribute() *Attribute {
	return n2.attribute
}
