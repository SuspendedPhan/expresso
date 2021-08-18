package ast

import (
	"encoding/json"
	"expressionista/common"
	"expressionista/hydration"
	"expressionista/protos"
	"github.com/davecgh/go-spew/spew"
	"github.com/stretchr/testify/assert"
	"os"
	"path/filepath"
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

func TestRehydrateAttribute(t *testing.T) {
	assert.NoError(t, dumpActual("hello"))
	registry := hydration.PolymorphRegistryInstance
	RegisterPolymorphs(&registry)
	attr := NewAttribute()
	numberNode := NewNumberNode(10)
	numberNode.SetId("bc0bd040-8241-42bb-90b5-44756935fd45")
	attr.setRootNode(numberNode)
	attr.SetId("9e9c495c-7837-43c6-bd9b-eb4126569bf7")

	deAttr, err := hydration.Dehydrate(reflect.ValueOf(attr))
	assert.NoError(t, err)

	root, err := registry.NewPolymorph(attr, deAttr.Interface())
	assert.NoError(t, err)

	rehydrated, err := hydration.Rehydrate(reflect.ValueOf(root), registry)
	assert.NoError(t, err)

	err = dumpActual(rehydrated.Interface())
	assert.NoError(t, err)

	assert.Equal(t, root, rehydrated)
}

func TestDehydrateAttribute(t *testing.T) {
	RegisterPolymorphs(&hydration.PolymorphRegistryInstance)
	attribute := NewAttribute()
	numberNode := NewNumberNode(10)
	numberNode.SetId("bc0bd040-8241-42bb-90b5-44756935fd45")
	attribute.setRootNode(numberNode)
	attribute.SetId("9e9c495c-7837-43c6-bd9b-eb4126569bf7")
	expected := `{"RootNode":{"TypeId":"f6261e46-ca56-4bfa-93ad-a14a3e1b3f05","Value":{"Value":10,"NodeBase":{"Id":{"Id":"bc0bd040-8241-42bb-90b5-44756935fd45"},"ParentNode":"","Attribute":"9e9c495c-7837-43c6-bd9b-eb4126569bf7"}}},"Name":{"Name":""},"Id":{"Id":"9e9c495c-7837-43c6-bd9b-eb4126569bf7"}}`
	dehydrated, err := hydration.Dehydrate(reflect.ValueOf(attribute))
	assert.Nil(t, err)
	marshal, err := json.Marshal(dehydrated.Interface())
	assert.Nil(t, err)
	assert.Equal(t, expected, string(marshal))
}

func Unmarshal(marshal []byte, hydratedType reflect.Type) (_ reflect.Value, err error) {
	defer common.AddErrorInfo(&err, "Unmarshal", hydratedType.String())()
	dehydration, err := hydration.DehydrateType(hydratedType)
	unmarshaled := reflect.New(dehydration.DehydratedType)
	println(string(marshal))
	println()
	spew.Dump(unmarshaled.Interface())
	err = json.Unmarshal(marshal, unmarshaled.Interface())
	return reflect.Value{}, nil
}

func TestTemp(t *testing.T) {
}

func TestPolymorphUnmarshal(t *testing.T) {
	hydration.PolymorphRegistryInstance.Register(0, "2acd")
	marshal, err := json.Marshal(hydration.Polymorph{
		TypeId: "2acd",
		Value:  4,
	})
	assert.NoError(t, err)
	container := hydration.Polymorph{}
	err = json.Unmarshal(marshal, &container)
	assert.NoError(t, err)
	assert.Equal(t, "2acd", container.TypeId)
	assert.Equal(t, float64(4), container.Value)
}

func TestUnmarshal(t *testing.T) {
	RegisterPolymorphs(&hydration.PolymorphRegistryInstance)
	attribute := NewAttribute()
	numberNode := NewNumberNode(10)
	numberNode.SetId("bc0bd040-8241-42bb-90b5-44756935fd45")
	attribute.setRootNode(numberNode)
	attribute.SetId("9e9c495c-7837-43c6-bd9b-eb4126569bf7")

	dehydrated, err := hydration.Dehydrate(reflect.ValueOf(attribute))
	assert.Nil(t, err)
	marshal, err := json.Marshal(dehydrated.Interface())
	assert.Nil(t, err)
	unmarshaled, err := Unmarshal(marshal, reflect.TypeOf(attribute))
	assert.Nil(t, err)
	assert.NotNil(t, unmarshaled)
}

func testDehydrateAndMarshal(t *testing.T, obj interface{}) {
	dehydratedNode, err := hydration.Dehydrate(reflect.ValueOf(obj))
	if err != nil {
		t.Fatal(err)
	}
	if shouldDebug {
		spew.Dump(dehydratedNode.Interface())
	}
	marshal, err := json.Marshal(dehydratedNode.Interface())
	println(string(marshal))
	if err != nil {
		println(err.Error())
	}

	dehydratedStruct, err := hydration.DehydrateType(reflect.ValueOf(obj).Type())
	if err != nil {
		t.Fatal(err)
	}
	unmarshaledNode := reflect.New(dehydratedStruct.DehydratedType)
	err = json.Unmarshal(marshal, unmarshaledNode.Interface())
	if err != nil {
		println(err.Error())
	}
	abs1, _ := filepath.Abs(`..\work\actual.txt`)
	abs2, _ := filepath.Abs(`..\work\expected.txt`)
	f1, err := os.Create(abs1)
	assert.Nil(t, err)
	f2, err := os.Create(abs2)
	assert.Nil(t, err)
	spew.Fdump(f1, dehydratedNode.Interface())
	spew.Fdump(f2, unmarshaledNode.Elem().Interface())
	//assert.Equal(t, dehydratedNode.Interface(), unmarshaledNode.Elem().Interface())
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

func dumpActual(dump interface{}) (err error) {
	hnd := common.NewHandler(&err)
	defer hnd.Handle()

	abs, err := filepath.Abs(`..\work\actual.txt`)
	hnd.AssertNilErr(err)

	open, err := os.Create(abs)
	defer func() {
		err := open.Close()
		hnd.AssertNilErr(err)
	}()
	hnd.AssertNilErr(err)

	spew.Fdump(open, dump)
	return nil
}

func dumpExpected(err error, dump interface{}) error {
	hnd := common.NewHandler(&err)
	defer hnd.Handle()

	abs, err := filepath.Abs(`..\work\expected.txt`)
	hnd.AssertNilErr(err)

	open, err := os.Create(abs)
	hnd.AssertNilErr(err)

	spew.Fdump(open, dump)
	return nil
}
