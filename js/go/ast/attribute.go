package ast

import "expressionista/common"

type Attribute struct {
	RootNode Node
	common.Name
	common.Id
	OnRootNodeChanged chan struct{}
}

func NewAttribute() *Attribute {
	return &Attribute{OnRootNodeChanged: make(chan struct{})}
}

func (a Attribute) eval(evalContext *EvalContext) Value {
	return a.RootNode.Eval(evalContext)
}

func (a *Attribute) setRootNode(node Node) {
	node.SetAttribute(a)
	a.RootNode = node
	go func() {
		a.OnRootNodeChanged <- struct{}{}
	}()
}