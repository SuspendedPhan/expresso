package ast

import (
	"expressionista/common"
	"github.com/google/uuid"
)

type Attribute struct {
	RootNode Node `hydration:"polymorph"`
	common.Name
	common.Id
	OnRootNodeChanged chan struct{} `json:"-"`
}

func NewAttribute() *Attribute {
	attribute := Attribute{OnRootNodeChanged: make(chan struct{})}
	attribute.SetId(uuid.NewString())
	return &attribute
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
