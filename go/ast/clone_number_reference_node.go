package ast

type CloneNumberReferenceNode struct {
	NodeBase
	organism *Organism
}

func (c CloneNumberReferenceNode) Eval(ctx *EvalContext) Value {
	return ctx.cloneNumberByOrganism[c.organism]
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
	node := CloneNumberReferenceNode{NodeBase: NewNodeBase(), organism: organism}
	return &node
}
