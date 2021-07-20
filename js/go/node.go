package main

import "fmt"

type Node interface {
	eval() float
	replaceChild(old Node, new Node)
	getParentNode() Node
	setParentNode(n Node)
	getId() string
	getOnChildReplaced() <-chan struct{}
	setAttribute(a *Attribute)
	getAttribute() *Attribute
	getText() string
	getChildren() []Node
}

func replace(old Node, new Node) {
	parentNode := old.getParentNode()
	fmt.Printf("%+v\n", old)
	if parentNode == nil {
		old.getAttribute().setRootNode(new)
	} else {
		parentNode.replaceChild(old, new)
	}
}
