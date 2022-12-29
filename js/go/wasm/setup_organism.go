package main

import (
	"expressioni.sta/ast"
	"syscall/js"
)

func setupOrganism(organism *ast.Organism, vue vue, context expressorContext) interface{} {
	attributes := vue.ref.Invoke()
	attributes.Set("value", getAttributesArray(organism, vue, context))
	organism.OnAttributesChanged.On(func() {
		attributes.Set("value", getAttributesArray(organism, vue, context))
	})

	returnValue := makeEmptyObject()
	returnValue.Set("attributes", attributes)
	returnValue.Set("name", organism.GetName())
	returnValue.Set("id", organism.GetId())
	returnValue.Set("addAttribute", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		organism.AddAttribute()
		return nil
	}))
	return returnValue
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
