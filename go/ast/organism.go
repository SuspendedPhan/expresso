package ast

import (
	"strconv"

	"expressioni.sta/common"
	"expressioni.sta/protos"
	"github.com/google/uuid"
)

type Organism struct {
	common.Id
	common.Name
	PlayerAttributes                   []*Attribute
	IntrinsicAttributeByProtoAttribute map[*protos.ProtoAttribute]*IntrinsicAttribute
	OnAttributesChanged                *Signal
	Suborganisms                       []*Organism
}

func NewOrganism() *Organism {
	o := &Organism{Suborganisms: make([]*Organism, 0)}
	o.SetId(uuid.NewString())
	o.OnAttributesChanged = NewSignal()
	o.IntrinsicAttributeByProtoAttribute = make(map[*protos.ProtoAttribute]*Attribute)
	clonesAttribute := NewAttribute()
	clonesAttribute.SetName("clones")
	clonesAttribute.SetRootNode(NewNumberNode(1))
	o.IntrinsicAttributeByProtoAttribute[protos.ClonesAttribute] = clonesAttribute
	return o
}

var attrCount = 0

func (o *Organism) AddAttribute() *Attribute {
	attribute := NewAttribute()
	attribute.SetName("attrib" + strconv.Itoa(attrCount))
	attrCount++
	attribute.SetRootNode(NewNumberNode(0))
	o.PlayerAttributes = append(o.PlayerAttributes, attribute)
	o.OnAttributesChanged.Dispatch()
	return attribute
}

func (o *Organism) Eval(ctx *EvalContext) *OrganismOutput {
	clonesAttribute := o.IntrinsicAttributeByProtoAttribute[protos.ClonesAttribute]
	clones := clonesAttribute.eval(ctx)
	organismOutput := NewOrganismOutput()
	for i := 0; i < int(clones); i++ {
		ctx.cloneNumberByOrganism[o] = Float(i)
		cloneOutput := NewCloneOutput()
		for protoAttribute, attribute := range o.IntrinsicAttributeByProtoAttribute {
			if attribute == clonesAttribute {
				continue
			}
			value := attribute.eval(ctx)
			cloneOutput.ValueByProtoAttribute[protoAttribute] = value
		}

		for _, suborganism := range o.Suborganisms {
			suborganismOutput := suborganism.Eval(ctx)
			cloneOutput.SuborganismOutputs = append(cloneOutput.SuborganismOutputs, suborganismOutput)
		}
		organismOutput.CloneOutputs = append(organismOutput.CloneOutputs, cloneOutput)
	}
	delete(ctx.cloneNumberByOrganism, o)
	return organismOutput
}

func (o *Organism) AddIntrinsicAttribute(proto *protos.ProtoAttribute) {
	attribute := NewAttribute()
	rootNode := NewNumberNode(0)
	attribute.SetRootNode(rootNode)
	attribute.Name = proto.Name
	o.IntrinsicAttributeByProtoAttribute[proto] = attribute
}

func NewOrganismFromProto(proto *protos.ProtoOrganism) *Organism {
	organism := NewOrganism()
	for _, attribute := range proto.ProtoAttributes {
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

// Attributes returns a slice containing this organism's player attributes and intrinsic attributes.
func (o *Organism) Attributes() []*Attribute {
	attributes := make([]*Attribute, 0)
	for _, attribute := range o.PlayerAttributes {
		attributes = append(attributes, attribute)
	}
	for _, attribute := range o.IntrinsicAttributeByProtoAttribute {
		attributes = append(attributes, attribute)
	}
	return attributes
}

func (o *Organism) AddSuborganism(organism *Organism) {
	o.Suborganisms = append(o.Suborganisms, organism)
}
