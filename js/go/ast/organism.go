package ast

import (
	"encoding/json"
	"github.com/google/uuid"
)

type Organism struct {
	Id
	PlayerAttributes          []*Attribute
	AttributeByProtoAttribute map[*ProtoAttribute]*Attribute
	OnAttributesChanged       *Signal
}

func NewOrganism() *Organism {
	o := &Organism{}
	o.setId(uuid.NewString())
	o.OnAttributesChanged = NewSignal()
	o.AttributeByProtoAttribute = make(map[*ProtoAttribute]*Attribute)
	return o
}

func (o *Organism) AddAttribute() *Attribute {
	attribute := NewAttribute()
	o.PlayerAttributes = append(o.PlayerAttributes, attribute)
	return attribute
}

func (o *Organism) Eval() OrganismOutput {
	return OrganismOutput{ValueByProtoAttribute: map[*ProtoAttribute]Float{
		ProtoCircle.X:      10,
		ProtoCircle.Y:      20,
		ProtoCircle.Radius: 5,
	}}
}

func (o *Organism) AddProtoAttribute(proto *ProtoAttribute) {
	attribute := NewAttribute()
	rootNode := NewNumberNode(0)
	attribute.setRootNode(&rootNode)
	attribute.Name = proto.Name
	o.AttributeByProtoAttribute[proto] = attribute
}

func (a Organism) MarshalJSON() ([]byte, error) {
	return json.Marshal(a)
}

func (a *Organism) UnmarshalJSON(b []byte) error {
	return nil
}
