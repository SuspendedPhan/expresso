package ast

import (
	"expressionista/common"
	"expressionista/protos"
	"testing"
)

func TestName(t *testing.T) {
	time := NewExternalAttribute("Time")

	addFunction := PrimitiveFunctions["+"]
	addParam0 := addFunction.parameters[0]
	addParam1 := addFunction.parameters[1]

	averageFunction := NewFunction("Average")

	protoCircle := protos.NewProtoOrganism()
	protoRadius := protos.NewProtoAttribute("Radius")
	protoCircle.IntrinsicAttributes = append(protoCircle.IntrinsicAttributes, protoRadius)

	earth := NewOrganism()
	intensity := earth.AddAttribute()
	intensity.SetName("intensity")
	intensityRootNode := NewPrimitiveFunctionCallNode(addFunction)
	intensityRootNode.SetArgument(addParam0, NewExternalAttributeReferenceNode(time))
	intensityRootNode.SetArgument(addParam1, NewNumberNode(10))
	intensity.setRootNode(intensityRootNode)

	moon := NewOrganismFromProto(protoCircle)

	radius, ok := moon.IntrinsicAttributeByProtoAttribute[protoRadius]
	common.Assert(ok)
	radiusNode := NewFunctionCallNode(averageFunction)
	radiusNode.setArgumentByIndex(0, NewAttributeReferenceNode(intensity))
	radiusNode.setArgumentByIndex(1, NewCloneNumberReferenceNode(moon))
	radius.setRootNode(radiusNode)

	answer := earth.Eval()
	if answer.CloneOutputs[0].SuborganismOutputs[0].CloneOutputs[0].ValueByProtoAttribute[protoRadius] != 7.5 {
		t.Error()
	}

	if answer.CloneOutputs[0].SuborganismOutputs[0].CloneOutputs[1].ValueByProtoAttribute[protoRadius] != 8 {
		t.Error()
	}
}
