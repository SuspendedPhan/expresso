package main

import (
	"fmt"
	"github.com/google/uuid"
)

type float = float32

type NumberNode struct {
	value float
	NodeBase
}

func NewNumberNode(value float) NumberNode {
	node := NumberNode{value: value}
	node.setId(uuid.NewString())
	return node
}

func (n2 *NumberNode) replaceChild(old Node, new Node) {
	panic("no children")
}

func (n NumberNode) eval() float32 {
	return n.value
}

func (n2 *NumberNode) getText() string {
	text := fmt.Sprintf("x = %.6f\n", n2.value)
	return text
}
