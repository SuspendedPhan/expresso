package main

import (
	"expressioni.sta/ast"
	"syscall/js"
)

// setupOrganism returns the refs needed for the Organism Vue Component's setup method.
func setupOrganism(organism *ast.Organism, vue vue, context expressorContext) js.Value {
	attributes := vue.ref.Invoke()
	attributes.Set("value", getAttributesArray(organism, vue, context))
	organism.OnAttributesChanged.On(func() {
		attributes.Set("value", getAttributesArray(organism, vue, context))
	})

	childrenRef := vue.ref.Invoke()
	childrenRef.Set("value", getOrganismsArray(organism.Suborganisms, vue, context))

	returnValue := makeEmptyObject()
	returnValue.Set("attributes", attributes)
	returnValue.Set("name", organism.GetName())
	returnValue.Set("id", organism.GetId())
	returnValue.Set("addAttribute", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		organism.AddAttribute()
		return nil
	}))
	returnValue.Set("addChildOrganism", js.FuncOf(func(this js.Value, args []js.Value) any {
		subOrg := newOrganism(context)
		organism.AddSuborganism(subOrg)
		childrenRef.Set("value", getOrganismsArray(organism.Suborganisms, vue, context))
		return nil
	}))
	returnValue.Set("children", childrenRef)
	return returnValue
}

func newOrganism(context expressorContext) *ast.Organism {
	subOrg := ast.NewOrganism()
	subOrg.SetName(context.createOrganismName())
	subOrg.AddIntrinsicAttribute(ast.GetProtoCircle().X)
	subOrg.AddIntrinsicAttribute(ast.GetProtoCircle().Y)
	subOrg.AddIntrinsicAttribute(ast.GetProtoCircle().Radius)
	return subOrg
}

// getOrganismsArray returns [{ id, setupFunc }]
func getOrganismsArray(organisms []*ast.Organism, vue vue, context expressorContext) js.Value {
	arr := makeEmptyArray()
	for i, el := range organisms {
		el := el
		childValue := makeEmptyObject()
		childValue.Set("id", el.GetId())
		childValue.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return setupOrganism(el, vue, context)
		}))
		arr.SetIndex(i, childValue)
	}
	return arr
}
