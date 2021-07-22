package main

import "github.com/google/uuid"

type Organism struct {
	Id
	Attributes                []*Attribute
	attributeByProtoAttribute map[*ProtoAttribute]*Attribute
	onAttributesChanged       *Signal
}

func (o *Organism) addAttribute() *Attribute {
	attribute := NewAttribute()
	o.Attributes = append(o.Attributes, attribute)
	return attribute
}

func (o *Organism) eval() OrganismOutput {
	return OrganismOutput{valueByProtoAttribute: map[*ProtoAttribute]float{
		protoCircle.X:      10,
		protoCircle.Y:      20,
		protoCircle.Radius: 5,
	}}
}

func NewOrganism() *Organism {
	o := &Organism{}
	o.setId(uuid.NewString())
	o.onAttributesChanged = NewSignal()
	return o
}
