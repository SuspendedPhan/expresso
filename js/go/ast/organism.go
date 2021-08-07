package ast

import (
	"encoding/json"
	"expressionista/common"
	"expressionista/protos"
	"github.com/google/uuid"
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

func (o *Organism) Eval() OrganismOutput {
	output := CloneOutput{ValueByProtoAttribute: map[*protos.ProtoAttribute]Float{
		ProtoCircle.X:      10,
		ProtoCircle.Y:      20,
		ProtoCircle.Radius: 5,
	}}
	return OrganismOutput{CloneOutputs: []*CloneOutput{&output}}
}

func (o *Organism) AddProtoAttribute(proto *protos.ProtoAttribute) {
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
	panic("not implemented")
}
