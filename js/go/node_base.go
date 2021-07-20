package main

type NodeBase struct {
	Id
	parentNode        Node
	onChildrenChanged chan struct{}
	attribute         *Attribute
}

func (n2 *NodeBase) getOnChildrenChanged() <-chan struct{} {
	return n2.onChildrenChanged
}

func (n2 *NodeBase) setParentNode(n Node) {
	n2.parentNode = n
}

func (n2 NodeBase) getParentNode() Node {
	return n2.parentNode
}

func (n2 *NodeBase) setAttribute(a *Attribute) {
	n2.attribute = a
}

func (n2 *NodeBase) getAttribute() *Attribute {
	return n2.attribute
}
