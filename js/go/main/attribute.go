package main

type Attribute struct {
	RootNode Node
	Name
	Id
	onRootNodeChanged chan struct{}
}

func NewAttribute() *Attribute {
	return &Attribute{onRootNodeChanged: make(chan struct{})}
}

func (a Attribute) eval() float32 {
	return a.RootNode.eval()
}

func (a *Attribute) setRootNode(node Node) {
	node.setAttribute(a)
	a.RootNode = node
	go func() {
		a.onRootNodeChanged <- struct{}{}
	}()
}
