package ast

import (
	"expressioni.sta/common"
	"github.com/google/uuid"
)

type Attribute struct {
	RootNode Node
	common.Name
	common.Id
	OnRootNodeChanged *Signal
}

func NewAttribute() *Attribute {
	attribute := Attribute{OnRootNodeChanged: NewSignal()}
	attribute.SetId(uuid.NewString())
	return &attribute
}

func (a Attribute) eval(evalContext *EvalContext) Value {
	return a.RootNode.Eval(evalContext)
}

func (a *Attribute) SetRootNode(node Node) {
	node.SetAttribute(a)
	a.RootNode = node
	a.OnRootNodeChanged.Dispatch()
}
