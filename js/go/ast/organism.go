package ast

import (
	"encoding/json"
	"expressionista/common"
	"expressionista/protos"
	"github.com/google/uuid"
	"syscall"
)

type Organism struct {
	common.Id
	PlayerAttributes                   []*Attribute
	IntrinsicAttributeByProtoAttribute map[*protos.ProtoAttribute]*IntrinsicAttribute
	OnAttributesChanged                *Signal
}

func NewOrganism() *Organism {
	o := &Organism{}
	o.SetId(uuid.NewString())
	o.OnAttributesChanged = NewSignal()
	o.IntrinsicAttributeByProtoAttribute = make(map[*protos.ProtoAttribute]*Attribute)
	o.IntrinsicAttributeByProtoAttribute[protos.ClonesAttribute] = NewAttribute()
	return o
}

func (o *Organism) AddAttribute() *Attribute {
	attribute := NewAttribute()
	o.PlayerAttributes = append(o.PlayerAttributes, attribute)
	return attribute
}

func (o *Organism) Eval(ctx *EvalContext) OrganismOutput {
	clones := o.IntrinsicAttributeByProtoAttribute[protos.ClonesAttribute].eval(ctx)
	for i := 0; i < int(clones); i++ {
		cloneOutput := NewCloneOutput()
		for _, attribute := range o.getEvalableAttributes() {
			value := attribute.eval(ctx)

		}
	}
}

func NewCloneOutput() *CloneOutput {
	return &CloneOutput{
		ValueByProtoAttribute: make(map[*protos.ProtoAttribute]Float),
		SuborganismOutputs:    make([]*OrganismOutput, 0),
	}
}

func (o *Organism) EvalBak() OrganismOutput {
	output := CloneOutput{ValueByProtoAttribute: map[*protos.ProtoAttribute]Float{
		ProtoCircle.X:      10,
		ProtoCircle.Y:      20,
		ProtoCircle.Radius: 5,
	}}
	return OrganismOutput{CloneOutputs: []*CloneOutput{&output}}
}

func (o *Organism) AddIntrinsicAttribute(proto *protos.ProtoAttribute) {
	attribute := NewAttribute()
	rootNode := NewNumberNode(0)
	attribute.setRootNode(rootNode)
	attribute.Name = proto.Name
	o.IntrinsicAttributeByProtoAttribute[proto] = attribute
}

func (a Organism) MarshalJSON() ([]byte, error) {
	return json.Marshal(a)
}

func (a *Organism) UnmarshalJSON(b []byte) error {
	return nil
}

func NewOrganismFromProto(proto *protos.ProtoOrganism) *Organism {
	organism := NewOrganism()
	for _, attribute := range proto.IntrinsicAttributes {
		organism.AddIntrinsicAttribute(attribute)
	}
	return organism
}

type EvalableAttribute interface {
	eval(evalContext *EvalContext) Value
}

func (o *Organism) getEvalableAttributes() []EvalableAttribute {
	attributes := make([]EvalableAttribute, 0)
	for _, attribute := range o.PlayerAttributes {
		attributes = append(attributes, attribute)
	}
	for _, attribute := range o.IntrinsicAttributeByProtoAttribute {
		attributes = append(attributes, attribute)
	}
	return attributes
}
