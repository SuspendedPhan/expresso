package ast

type ExternalAttributeReferenceNode struct {
	NodeBase
	ExternalAttribute *ExternalAttribute
}

func (e ExternalAttributeReferenceNode) Eval(ctx *EvalContext) Value {
	if value, ok := ctx.valueByExternalAttribute[e.ExternalAttribute]; ok {
		return value
	}
	panic("external attribute not given")
}

func (e ExternalAttributeReferenceNode) ReplaceChild(old Node, new Node) {
	panic("implement me")
}

func (e ExternalAttributeReferenceNode) GetText() string {
	panic("implement me")
}

func (e ExternalAttributeReferenceNode) GetChildren() []Node {
	panic("implement me")
}

func NewExternalAttributeReferenceNode(externalAttribute *ExternalAttribute) *ExternalAttributeReferenceNode {
	return &ExternalAttributeReferenceNode{NodeBase: NewNodeBase(), ExternalAttribute: externalAttribute}
}
