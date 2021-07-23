package main

import (
	"encoding/json"
	"github.com/google/uuid"
)

type Organism struct {
	Id
	PlayerAttributes          []*Attribute
	attributeByProtoAttribute map[*ProtoAttribute]*Attribute
	onAttributesChanged       *Signal
}

func NewOrganism() *Organism {
	o := &Organism{}
	o.setId(uuid.NewString())
	o.onAttributesChanged = NewSignal()
	o.attributeByProtoAttribute = make(map[*ProtoAttribute]*Attribute)
	return o
}

func (o *Organism) addAttribute() *Attribute {
	attribute := NewAttribute()
	o.PlayerAttributes = append(o.PlayerAttributes, attribute)
	return attribute
}

func (o *Organism) eval() OrganismOutput {
	return OrganismOutput{ValueByProtoAttribute: map[*ProtoAttribute]float{
		protoCircle.X:      10,
		protoCircle.Y:      20,
		protoCircle.Radius: 5,
	}}
}

func (o *Organism) addProtoAttribute(proto *ProtoAttribute) {
	attribute := NewAttribute()
	rootNode := NewNumberNode(0)
	attribute.setRootNode(&rootNode)
	attribute.name = proto.name
	o.attributeByProtoAttribute[proto] = attribute
}

func (a Organism) MarshalJSON() ([]byte, error) {
	return json.Marshal(a)
}

func (a *Organism) UnmarshalJSON(b []byte) error {
	return nil
}
