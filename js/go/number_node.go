package main

type NumberNode struct {
	value float32
	NodeBase
}

func (n2 *NumberNode) replaceChild(old Node, new Node) {
	panic("no children")
}

func (n NumberNode) eval() float32 {
	return n.value
}
