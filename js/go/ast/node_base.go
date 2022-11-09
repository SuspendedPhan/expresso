package ast

import (
	"expressioni.sta/common"
	"github.com/google/uuid"
)

type NodeBase struct {
	common.Id
	ParentNode      Node
	childrenChanged *Signal
	Attribute       *Attribute
}

func NewNodeBase() NodeBase {
	base := NodeBase{}
	base.childrenChanged = NewSignal()
	base.SetId(uuid.NewString())
	return base
}

func (n2 *NodeBase) GetChildrenChanged() *Signal {
	return n2.childrenChanged
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
