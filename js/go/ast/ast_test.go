package ast

import (
	"encoding/json"
	"expressionista/common"
	"expressionista/protos"
	"github.com/davecgh/go-spew/spew"
	"github.com/stretchr/testify/assert"
	"reflect"
	"testing"
)

func TestDehydrateAttributeReferenceNode(t *testing.T) {
	attribute := NewAttribute()
	attribute.SetName("radius")
	node := NewAttributeReferenceNode(attribute)
	attribute.setRootNode(node)
	testDehydrateAndMarshal(t, node)
}

const shouldDebug = false

func TestDehydrateAttribute(t *testing.T) {
	attribute := NewAttribute()
	attribute.setRootNode(NewNumberNode(10))
	testDehydrateAndMarshal(t, attribute)
}

func testDehydrateAndMarshal(t *testing.T, obj interface{}) {
	dehydratedNode := dehydrate(reflect.ValueOf(obj))
	if shouldDebug {
		spew.Dump(dehydratedNode.Interface())
	}
	marshal, err := json.Marshal(dehydratedNode.Interface())
	if err != nil {
		println(err.Error())
	}

	dehydratedStruct := GetDehydratedStruct(reflect.TypeOf(obj).Elem())
	unmarshaledNode := reflect.New(dehydratedStruct)
	err = json.Unmarshal(marshal, unmarshaledNode.Interface())
	if err != nil {
		println(err.Error())
	}
	assert.Equal(t, dehydratedNode.Interface(), unmarshaledNode.Elem().Interface())
}

func TestUltimate(t *testing.T) {
	project, earth, protoRadius, time := CreateUltimateTestProject()

	marshaledProject, err := json.Marshal(project)
	assert.NoErrorf(t, err, "no error")
	unmarshaledProject := &Project{}
	err = json.Unmarshal(marshaledProject, unmarshaledProject)
	assert.NoErrorf(t, err, "no error")

	context := NewEvalContext()

	earth = project.GetOrganismById(earth.GetId())

	context.valueByExternalAttribute[time] = 5
	answer := earth.Eval(context)

	assert.Equal(t, Float(7.5), answer.CloneOutputs[0].SuborganismOutputs[0].CloneOutputs[0].ValueByProtoAttribute[protoRadius])
	assert.Equal(t, Float(8), answer.CloneOutputs[0].SuborganismOutputs[0].CloneOutputs[1].ValueByProtoAttribute[protoRadius])
}

func CreateUltimateTestProject() (project *Project, earth *Organism, protoRadius *protos.ProtoAttribute, time *ExternalAttribute) {
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
