package main

import (
	"fmt"
	"runtime/debug"
	"syscall/js"

	"expressioni.sta/ast"
	"expressioni.sta/protos"
)

// setupOrganism returns the refs needed for the Organism Vue Component's setup method.
func setupOrganism(organism *ast.Organism, vue vue, context expressorContext, layout ElementLayout) js.Value {
	attributes := vue.ref.Invoke()
	attributes.Set("value", getAttributesArray(organism, vue, context))
	organism.OnAttributesChanged.On(func() {
		attributes.Set("value", getAttributesArray(organism, vue, context))
	})

	childrenRef := vue.ref.Invoke()
	childrenRef.Set("value", getChildOrganismsArray(organism.Suborganisms, vue, context, layout))
	positionRef := vue.ref.Invoke()
	positionRef.Set("value", makeEmptyObject())
	positionRef.Get("value").Set("left", 0)
	positionRef.Get("value").Set("top", 0)
	rootElementRef := vue.ref.Invoke()

	ret := makeEmptyObject()
	ret.Set("attributes", attributes)
	ret.Set("name", organism.GetName())
	ret.Set("id", organism.GetId())
	ret.Set("addAttribute", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		organism.AddAttribute()
		return nil
	}))
	ret.Set("addChildOrganism", js.FuncOf(func(this js.Value, args []js.Value) any {
		defer func() {
			// See the section "Note on js.Func" in the README.
			if err := recover(); err != nil {
				println(fmt.Sprint(err))
				debug.PrintStack()
			}
		}()

		subOrg := newOrganism(context)
		organism.AddSuborganism(subOrg)
		childrenRef.Set("value", getChildOrganismsArray(organism.Suborganisms, vue, context, layout))
		return nil
	}))
	ret.Set("children", childrenRef)

	// position: { top: number, left: number } | The local position of the organism based on layout calculation.
	ret.Set("position", positionRef)

	// rootElement: HTMLElement | The element that will be used to determine the size of the component for layout purposes.
	ret.Set("rootElement", rootElementRef)

	ret.Set("remove", js.FuncOf(func(this js.Value, args []js.Value) any {
		// Not implemented yet. Activate the TestRemoveOrganism test before implementing.
		return nil
	}))

	layout.getLocalPositionObservable(organism.GetId()).Call("subscribe", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		positionRef.Set("value", args[0])
		return nil
	}))

	vue.nextTick.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// This is done in the next tick so that the Vue component can bind the rootElement ref.
		layout.registerElement(rootElementRef.Get("value"), organism.GetId())

		// This must execute after registerElement() and localPositionObservable.subscribe().
		layout.recalculate()
		return nil
	}))

	var offElementResized = func() {}
	vue.nextTick.Invoke(js.FuncOf(func(this js.Value, args []js.Value) any {
		offElementResized = onElementResized(vue.resizeSensorClass, rootElementRef.Get("value"), func() {
			layout.recalculate()
		})
		return nil
	}))
	vue.onUnmounted.Invoke(js.FuncOf(func(this js.Value, args []js.Value) any {
		offElementResized()
		return nil
	}))
	return ret
}

func newOrganism(context expressorContext) *ast.Organism {
	subOrg := ast.NewOrganismFromProto(protos.ProtoCircle)
	subOrg.SetName(context.createOrganismName())
	context.organismIdToOrganism[subOrg.GetId()] = subOrg
	return subOrg
}

// getChildOrganismsArray returns [{ id, setupFunc }]
func getChildOrganismsArray(organisms []*ast.Organism, vue vue, context expressorContext, layout ElementLayout) js.Value {
	arr := makeEmptyArray()
	for i, el := range organisms {
		el := el
		childValue := makeEmptyObject()
		childValue.Set("id", el.GetId())
		childValue.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return setupOrganism(el, vue, context, layout)
		}))
		arr.SetIndex(i, childValue)
	}
	return arr
}
