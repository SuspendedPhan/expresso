package ast

import (
	"fmt"
	"github.com/google/uuid"
)

type Float = float32

type NumberNode struct {
	Value Float
	NodeBase
}

func NewNumberNode(value Float) *NumberNode {
	node := NumberNode{Value: value, NodeBase: NewNodeBase()}
	node.SetId(uuid.NewString())
	return &node
}

func (n2 *NumberNode) ReplaceChild(old Node, new Node) {
	panic("no children")
}

func (n NumberNode) Eval(*EvalContext) Float {
	return n.Value
}

func (n2 *NumberNode) GetText() string {
	return NumberToString(n2.Value)
}

func (n2 NumberNode) GetChildren() []Node {
	return []Node{}
}

func NumberToString(number Float) string {
	text := fmt.Sprintf("%.2f", number)
	return text
}
