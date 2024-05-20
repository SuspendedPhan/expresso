package ast

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
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
	attribute.SetRootNode(num)
	n := NewAttributeReferenceNode(attribute)

	nJson := marshalAttrRefNode(n)
	nAgain := unmarshalAttrRefNode(nJson)
	assert.Equal(t, float32(10), (nAgain.Attribute.RootNode).(*NumberNode).Value)

}

func TestComplex(t *testing.T) {
	average := NewFunction("average")
	a := average.AddParameter("a")
	b := average.AddParameter("b")
	add := NewPrimitiveFunctionCallNode(PrimitiveFunctions["+"])
	add.SetArgumentByIndex(0, NewParameterNode(a))
	add.SetArgumentByIndex(0, NewParameterNode(b))
	div := NewPrimitiveFunctionCallNode(PrimitiveFunctions["/"])
	div.SetArgumentByIndex(0, add)
	div.SetArgumentByIndex(1, NewNumberNode(2))

	x := NewAttribute()
	x.SetName("x")
	x.SetRootNode(NewNumberNode(10))
	y := NewAttribute()
	y.SetName("y")
	y.SetRootNode(NewNumberNode(20))

	averageCall := NewFunctionCallNode(average)
	averageCall.SetArgumentByIndex(0, NewAttributeReferenceNode(x))
	averageCall.SetArgumentByIndex(1, NewAttributeReferenceNode(y))
	radius := NewAttribute()
	radius.SetRootNode(averageCall)

	marshFuns := marshalFuns(average)
	marshAttrs := marshalAttrs(x, y, radius)

	unmarshFuns := unmarshalFuns(marshFuns)
	unmarshAttrs := unmarshalAttrs(marshAttrs)
	populateAttrNodes(unmarshAttrs, unmarshFuns)
}

func populateAttrNodes(attrs []*Attribute, funs []*Function) {

}

func unmarshalAttrs([]byte) []*Attribute {
	return nil
}

func unmarshalFuns([]byte) []*Function {
	return nil
}

func marshalAttrs(attrs ...*Attribute) []byte {
	return nil
}

func marshalFuns(funs ...*Function) []byte {
	return nil
}

func marshalAttrRefNode(n *AttributeReferenceNode) []byte {
	return nil
}

func unmarshalAttrRefNode(str []byte) AttributeReferenceNode {
	return AttributeReferenceNode{}
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
