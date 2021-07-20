package main

type Node interface {
	eval() float32
	replaceChild(old Node, new Node)
	getParentNode() Node
	setParentNode(n Node)
	getId() string
	getOnChildrenChanged() <-chan struct{}
	setAttribute(a *Attribute)
	getAttribute() *Attribute
	getText() string
}

func replace(old Node, new Node) {
	parentNode := old.getParentNode()
	println("replace")
	if parentNode == nil {
		println("nil")
		old.getAttribute().setRootNode(new)
	} else {
		println("not nil")
		parentNode.replaceChild(old, new)
	}
}
