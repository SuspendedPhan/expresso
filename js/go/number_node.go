package main

import (
	"fmt"
	"github.com/google/uuid"
)

type float = float32

type NumberNode struct {
	Value float
	NodeBase
}

func NewNumberNode(value float) NumberNode {
	node := NumberNode{Value: value, NodeBase: NewNodeBase()}
	node.setId(uuid.NewString())
	return node
}

func (n2 *NumberNode) replaceChild(old Node, new Node) {
	panic("no children")
}

func (n NumberNode) eval() float {
	return n.Value
}

func (n2 *NumberNode) getText() string {
	return numberToString(n2.Value)
}

func (n2 NumberNode) getChildren() []Node {
	return []Node{}
}

func numberToString(number float) string {
	text := fmt.Sprintf("x = %.6f\n", number)
	return text
}
