package main

type Attribute struct {
	rootNode Node
	Name
}

func (a Attribute) eval() float32 {
	return a.rootNode.eval()
}

func (a *Attribute) setRootNode(node Node) {
	a.rootNode = node
}
