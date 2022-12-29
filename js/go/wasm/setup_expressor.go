package main

import (
	"expressioni.sta/ast"
	"expressioni.sta/focus"
	"syscall/js"
)

// setupExpressor returns the refs needed for the Expressor Vue Component's setup method. The given rootOrganisms slice
// will be appended and shortened based on UI interactions.
func setupExpressor(vue vue, rootOrganisms *[]*ast.Organism) js.Value {
	keydown := NewJsEventDispatcher()
	onKeydown := js.FuncOf(func(this js.Value, args []js.Value) any {
		event := args[0]
		keydown.Dispatch(event)
		return nil
	})
	js.Global().Get("document").Call("addEventListener", "keydown", onKeydown)
	vue.onUnmounted.Invoke(js.FuncOf(func(this js.Value, args []js.Value) any {
		js.Global().Get("document").Call("removeEventListener", "keydown", onKeydown)
		return nil
	}))

	context := expressorContext{focus: focus.NewFocus(), documentKeydown: keydown}
	rootOrgsRef := vue.ref.Invoke()
	rootOrgsRef.Set("value", makeEmptyArray())

	ret := makeEmptyObject()
	ret.Set("rootOrganisms", rootOrgsRef)
	ret.Set("addOrganism", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		org := newOrganism(context)
		*rootOrganisms = append(*rootOrganisms, org)
		rootOrgsRef.Set("value", getOrganismsArray(*rootOrganisms, vue, context))
		return nil
	}))
	return ret
}
