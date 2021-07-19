package main

type NodeBase struct {
	Name
	parentNode Node
}

func (n2 *NodeBase) setParentNode(n Node) {
	n2.parentNode = n
}

func (n2 NodeBase) getParentNode() Node {
	return n2.parentNode
}
