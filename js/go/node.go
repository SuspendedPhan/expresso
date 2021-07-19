package main

type Node interface {
	eval() float32
	replaceChild(old Node, new Node)
	getParentNode() Node
	getName() string
	setParentNode(n Node)
}

func replace(old Node, new Node) {
	old.getParentNode().replaceChild(old, new)
}
