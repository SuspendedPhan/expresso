package ast

import "github.com/google/uuid"

type AttributeReferenceNode struct {
	NodeBase
	attribute *Attribute
}

func (a AttributeReferenceNode) Eval(ctx *EvalContext) Float {
	return a.attribute.eval(ctx)
}

func (a AttributeReferenceNode) ReplaceChild(old Node, new Node) {
	panic("implement me")
}

func (a AttributeReferenceNode) GetText() string {
	panic("implement me")
}

func (a AttributeReferenceNode) GetChildren() []Node {
	panic("implement me")
}

func NewAttributeReferenceNode(attribute *Attribute) *AttributeReferenceNode {
	node := AttributeReferenceNode{
		NodeBase:  NewNodeBase(),
		attribute: attribute,
	}
	node.SetId(uuid.NewString())
	return &node
}
