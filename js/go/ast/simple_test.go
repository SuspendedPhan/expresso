package ast

import (
	"encoding/json"
	"expressioni.sta/common"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestSimple(t *testing.T) {
	n := NewNumberNode(10)
	nJson := toJson(n)
	nAgain := fromJson(nJson)
	assert.Equal(t, float32(10), nAgain.Value)
}

func TestAttrRefNode(t *testing.T) {
	num := NewNumberNode(10)
	attribute := NewAttribute()
	attribute.setRootNode(num)
	n := NewAttributeReferenceNode(attribute)

	nJson := marshalAttrRefNode(n)
	nAgain := unmarshalAttrRefNode(nJson)
	assert.Equal(t, float32(10), (nAgain.Attribute.RootNode).(*NumberNode).Value)

}

func TestComplex(t *testing.T) {
	average := NewFunction("average")
	a := average.addParameter("a")
	b := average.addParameter("b")
	add := NewPrimitiveFunctionCallNode(PrimitiveFunctions["+"])
	add.SetArgumentByIndex(0, NewParameterNode(a))
	add.SetArgumentByIndex(0, NewParameterNode(b))
	div := NewPrimitiveFunctionCallNode(PrimitiveFunctions["/"])
	div.SetArgumentByIndex(0, add)
	div.SetArgumentByIndex(1, NewNumberNode(2))

	x := NewAttribute()
	x.SetName("x")
	x.setRootNode(NewNumberNode(10))
	y := NewAttribute()
	y.SetName("y")
	y.setRootNode(NewNumberNode(20))

	averageCall := NewFunctionCallNode(average)
	averageCall.setArgumentByIndex(0, NewAttributeReferenceNode(x))
	averageCall.setArgumentByIndex(1, NewAttributeReferenceNode(y))
	radius := NewAttribute()
	radius.setRootNode(averageCall)

	marshFuns := marshalFuns(average)
	marshAttrs := marshalAttrs(x, y, radius)

	unmarshFuns := unmarshalFuns(marshFuns)
	unmarshAttrs := unmarshalAttrs(marshAttrs)
	populateAttrNodes(unmarshAttrs, unmarshFuns)
}

func populateAttrNodes(attrs []*Attribute, funs []*Function) {

}

func unmarshalAttrs([]byte) []*Attribute {

}

func unmarshalFuns([]byte) []*Function {

}

func marshalAttrs(attrs ...*Attribute) []byte {

}

func marshalFuns(funs ...*Function) []byte {

}

func marshalAttrRefNode(n *AttributeReferenceNode) []byte {

}

func unmarshalAttrRefNode(str []byte) AttributeReferenceNode {

}

func fromJson(j []byte) NumberNode {
	n := NumberNode{}
	err := json.Unmarshal(j, &n)
	if err != nil {
		panic(err)
	}
	return n
}

func toJson(n *NumberNode) []byte {
	marshal, err := json.Marshal(n)
	if err != nil {
		panic(err)
	}
	return marshal
}
