package main

import "github.com/google/uuid"

type Organism struct {
	Id
	Attributes          []*Attribute
	onAttributesChanged *Signal
}

func (o *Organism) addAttribute() *Attribute {
	attribute := NewAttribute()
	o.Attributes = append(o.Attributes, attribute)
	return attribute
}

func NewOrganism() *Organism {
	o := &Organism{}
	o.setId(uuid.NewString())
	o.onAttributesChanged = NewSignal()
	return o
}
