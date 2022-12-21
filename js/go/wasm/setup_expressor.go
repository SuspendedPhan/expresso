package main

import (
	"expressioni.sta/ast"
	"expressioni.sta/focus"
	"strconv"
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

	count := 0

	rootOrgsRef := vue.ref.Invoke()
	rootOrgsRef.Set("value", makeEmptyArray())

	ret := makeEmptyObject()
	ret.Set("rootOrganisms", rootOrgsRef)
	ret.Set("addOrganism", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		org := ast.NewOrganism()
		org.SetName("organism" + strconv.Itoa(count))
		org.AddIntrinsicAttribute(ast.ProtoCircle.X)
		org.AddIntrinsicAttribute(ast.ProtoCircle.Y)
		org.AddIntrinsicAttribute(ast.ProtoCircle.Radius)
		count++
		*rootOrganisms = append(*rootOrganisms, org)

		context := expressorContext{focus: focus.NewFocus(), documentKeydown: keydown}
		rootOrgsRef.Set("value", getOrganismsArray(*rootOrganisms, vue, context))
		return nil
	}))
	return ret
}
