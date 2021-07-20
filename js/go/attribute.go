package main

type Attribute struct {
	rootNode Node
	Name
	Id
	onRootNodeChanged chan struct{}
}

func NewAttribute() *Attribute {
	return &Attribute{onRootNodeChanged: make(chan struct{})}
}

func (a Attribute) eval() float32 {
	return a.rootNode.eval()
}

func (a *Attribute) setRootNode(node Node) {
	node.setAttribute(a)
	a.rootNode = node
	go func() {
		a.onRootNodeChanged <- struct{}{}
	}()
}
