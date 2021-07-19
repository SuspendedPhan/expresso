package main

type AbsNode struct {
	argument Node
	NodeBase
}

func (n2 *AbsNode) replaceChild(old Node, new Node) {
	n2.argument = new
	new.setParentNode(n2)
}

func (n *AbsNode) setArgument(node Node) {
	n.argument = node
	node.setParentNode(n)
}

func (n AbsNode) eval() float32 {
	return n.argument.eval()
}
