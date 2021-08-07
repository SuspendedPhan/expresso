package ast

import (
	"expressionista/common"
	"expressionista/protos"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestName(t *testing.T) {
	earth, protoRadius, time := CreateUltimateTestProject()
	context := NewEvalContext()
	context.valueByExternalAttribute[time] = 5
	answer := earth.Eval(context)
	assert.Equal(t, Float(7.5), answer.CloneOutputs[0].SuborganismOutputs[0].CloneOutputs[0].ValueByProtoAttribute[protoRadius])
	assert.Equal(t, Float(8), answer.CloneOutputs[0].SuborganismOutputs[0].CloneOutputs[1].ValueByProtoAttribute[protoRadius])
}

func CreateUltimateTestProject() (earth *Organism, protoRadius *protos.ProtoAttribute, time *ExternalAttribute) {
	SetupPrimitiveFunctions()

	time = NewExternalAttribute("Time")

	addFunction := PrimitiveFunctions["+"]
	addParam0 := addFunction.parameters[0]
	addParam1 := addFunction.parameters[1]

	averageFunction := NewFunction("Average")
	averageFunctionParam0 := averageFunction.addParameter("a")
	averageFunctionParam1 := averageFunction.addParameter("b")
	divNode := NewPrimitiveFunctionCallNode(PrimitiveFunctions["/"])
	addNode := NewPrimitiveFunctionCallNode(PrimitiveFunctions["+"])
	addNode.SetArgumentByIndex(0, NewParameterNode(averageFunctionParam0))
	addNode.SetArgumentByIndex(1, NewParameterNode(averageFunctionParam1))
	divNode.SetArgumentByIndex(0, addNode)
	divNode.SetArgumentByIndex(1, NewNumberNode(2))
	averageFunction.setRootNode(divNode)

	protoCircle := protos.NewProtoOrganism()
	protoRadius = protos.NewProtoAttribute("Radius")
	protoCircle.IntrinsicAttributes = append(protoCircle.IntrinsicAttributes, protoRadius)

	earth = NewOrganism()
	intensity := earth.AddAttribute()
	intensity.SetName("intensity")
	intensityRootNode := NewPrimitiveFunctionCallNode(addFunction)
	intensityRootNode.SetArgument(addParam0, NewExternalAttributeReferenceNode(time))
	intensityRootNode.SetArgument(addParam1, NewNumberNode(10))
	intensity.setRootNode(intensityRootNode)

	moon := NewOrganismFromProto(protoCircle)
	earth.AddSuborganism(moon)

	radius, ok := moon.IntrinsicAttributeByProtoAttribute[protoRadius]
	common.Assert(ok)
	radiusNode := NewFunctionCallNode(averageFunction)
	radiusNode.setArgumentByIndex(0, NewAttributeReferenceNode(intensity))
	radiusNode.setArgumentByIndex(1, NewCloneNumberReferenceNode(moon))
	radius.setRootNode(radiusNode)

	moon.IntrinsicAttributeByProtoAttribute[protos.ClonesAttribute].setRootNode(NewNumberNode(2))

	return
}
