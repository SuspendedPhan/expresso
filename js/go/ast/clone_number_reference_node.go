package ast

type CloneNumberReferenceNode struct {
	NodeBase
}

func (c CloneNumberReferenceNode) Eval(*EvalContext) Float {
	panic("implement me")
}

func (c CloneNumberReferenceNode) ReplaceChild(old Node, new Node) {
	panic("implement me")
}

func (c CloneNumberReferenceNode) GetText() string {
	panic("implement me")
}

func (c CloneNumberReferenceNode) GetChildren() []Node {
	panic("implement me")
}

func NewCloneNumberReferenceNode(organism *Organism) *CloneNumberReferenceNode {
	node := CloneNumberReferenceNode{NewNodeBase()}
	return &node
}
