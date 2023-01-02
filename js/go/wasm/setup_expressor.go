package main

import (
	"expressioni.sta/ast"
	"expressioni.sta/focus"
	"fmt"
	"runtime/debug"
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

	context := expressorContext{focus: focus.NewFocus(), documentKeydown: keydown, organismIdToOrganism: make(map[string]*ast.Organism)}
	rootOrgsRef := vue.ref.Invoke()
	rootOrgsRef.Set("value", makeEmptyArray())

	// rootOrgs contains the info needed to render an Organism component, as opposed to the rootOrganisms parameter.
	rootOrgs := make([]rootOrganism, 0)

	ret := makeEmptyObject()
	ret.Set("rootOrganisms", rootOrgsRef)
	ret.Set("addOrganism", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		defer func() {
			// See the section "Note on js.Func" in the README.
			if err := recover(); err != nil {
				println(fmt.Sprint(err))
				debug.PrintStack()
			}
		}()
		org := newOrganism(context)
		*rootOrganisms = append(*rootOrganisms, org)

		layout := NewElementLayout(vue.elementLayoutClass, js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			// getRootNodeFunc
			return org.GetId()
		}).Value, js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			// getChildrenFunc
			orgId := args[0].String()
			return getOrganismChildrenIds(orgId, context.organismIdToOrganism)
		}).Value, js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			// getKeyFunc
			return args[0]
		}).Value, 100, 25)

		rootOrgs = append(rootOrgs, rootOrganism{
			org:    org,
			layout: layout,
		})
		rootOrgsRef.Set("value", getRootOrganismsArray(rootOrgs, vue, context))
		return nil
	}))
	return ret
}

// TODO: fix doc
// TODO: dedupe?
// getRootOrganismsArray returns [{ id, setupFunc }]
func getRootOrganismsArray(organisms []rootOrganism, vue vue, context expressorContext) js.Value {
	arr := makeEmptyArray()
	for i, el := range organisms {
		el := el
		childValue := makeEmptyObject()
		childValue.Set("id", el.org.GetId())
		childValue.Set("elementLayout", el.layout.elementLayout)
		childValue.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			defer func() {
				// See the section "Note on js.Func" in the README.
				if err := recover(); err != nil {
					println(fmt.Sprint(err))
					debug.PrintStack()
				}
			}()
			return setupOrganism(el.org, vue, context, el.layout)
		}))
		arr.SetIndex(i, childValue)
	}
	return arr
}

// getOrganismChildrenIds returns a js array of ids for the given organism, given an ID map.
func getOrganismChildrenIds(organismId string, organismIdToOrganism map[string]*ast.Organism) js.Value {
	ret := makeEmptyArray()
	org := organismIdToOrganism[organismId]
	for i, child := range org.Suborganisms {
		ret.SetIndex(i, child.GetId())
	}
	return ret
}

type rootOrganism struct {
	org    *ast.Organism
	layout ElementLayout
}
