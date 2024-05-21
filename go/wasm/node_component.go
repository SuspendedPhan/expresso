package main

import (
	"fmt"
	"runtime/debug"
	"strconv"
	"strings"
	"syscall/js"

	"expressioni.sta/app"
	"expressioni.sta/ast"
)

func setupNode(node ast.Node, vue vue, context attributeContext) js.Value {
	ret := makeEmptyObject()
	nodePickerChoicesRef := vue.ref.Invoke()
	nodePickerChoicesRef.Set("value", makeEmptyArray())
	childrenRef := vue.ref.Invoke()
	childrenRef.Set("value", getNodeChildren(node, vue, context))
	positionRef := vue.ref.Invoke()
	positionRef.Set("value", makeEmptyObject())
	positionRef.Get("value").Set("left", 0)
	positionRef.Get("value").Set("top", 0)
	isFocusedRef := vue.ref.Invoke()
	isFocusedRef.Set("value", context.expressorContext.focus.FocusedNode() == node)
	rootElementRef := vue.ref.Invoke()

	// The node picker is a searchbox that the user can use to pick a new node which will replace this node.
	nodePickerVisibleRef := vue.ref.Invoke()
	nodePickerVisibleRef.Set("value", false)
	nodePickerQueryRef := vue.ref.Invoke()
	nodePickerQueryRef.Set("value", "")
	nodePickerRef := vue.ref.Invoke()

	// key: string | The ID of this node. Used for the Vue special :key prop.
	ret.Set("key", node.GetId())

	// text: string | The display text for this node.
	ret.Set("text", node.GetText())

	// children: []{ id: string, setupFunc: function }
	ret.Set("children", childrenRef)

	// nodePickerChoices is an array of options for the user to replace this node with another node based on the query given to
	// nodePickerOnQueryInput. Each element is an object with the following keys:
	// - text: string | The display text for the node choice.
	// - commitFunc: function | A function to replace this node with the chosen node.
	ret.Set("nodePickerChoices", nodePickerChoicesRef)

	// nodePickerQuery: string | the user query used for picking a new node.
	ret.Set("nodePickerQuery", nodePickerQueryRef)

	// nodePickerOnQueryInput is called when the user types input into the node picker text box.
	// args[0]: Event | The js event. See documentation on MDN.
	ret.Set("nodePickerOnQueryInput", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		defer func() {
			// See the section "Note on js.Func" in the README.
			if err := recover(); err != nil {
				println(fmt.Sprint(err))
				debug.PrintStack()
			}
		}()

		event := args[0]
		event.Call("stopPropagation")

		query := event.Get("target").Get("value").String()
		nodePickerQueryRef.Set("value", query)
		nodePickerChoicesRef.Set("value", getNodePickerChoices(context, node, query))
		return nil
	}))

	// position: { top: number, left: number } | The local position of the node based on layout calculation.
	ret.Set("position", vue.readonly.Invoke(positionRef))

	// rootElement: HTMLElement | The element that will be used to determine the size of the component for layout purposes.
	ret.Set("rootElement", rootElementRef)

	ret.Set("onClick", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		event := args[0]

		// When this node is clicked, we want to consume the event to prevent its parent node from also receiving the
		// click.
		event.Call("stopPropagation")

		context.expressorContext.focus.SetFocusedNode(node)
		return nil
	}))

	// isFocused: bool | True if this node currently has focus.
	ret.Set("isFocused", isFocusedRef)

	// nodePickerVisible: bool | True if the node picker is visible.
	ret.Set("nodePickerVisible", nodePickerVisibleRef)

	// nodePickerOnCommit: func(choice) | Replaces this node with the chosen node. The choice parameter should be an
	// element of nodePickerChoices.
	ret.Set("nodePickerOnCommit", js.FuncOf(func(this js.Value, args []js.Value) any {
		choice := args[0]
		choice.Call("commitFunc")
		return nil
	}))

	// nodePickerOnBlur: func() | Called when the node picker loses browser-based focus. Currently does nothing.
	ret.Set("nodePickerOnBlur", js.FuncOf(func(this js.Value, args []js.Value) any {
		return nil
	}))

	// nodePicker: HTMLElement | The node picker element.
	ret.Set("nodePicker", nodePickerRef)

	// This is needed for the node layout.
	context.nodeIdToNode[node.GetId()] = node
	vue.onUnmounted.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// This logic has not been tested. Potential memory leak here.
		delete(context.nodeIdToNode, node.GetId())
		return nil
	}))

	context.layout.getLocalPositionObservable(node.GetId()).Call("subscribe", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		positionRef.Set("value", args[0])
		return nil
	}))

	vue.nextTick.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// This is done in the next tick so that the Vue component can bind the rootElement ref.
		context.layout.registerElement(rootElementRef.Get("value"), node.GetId())

		// This must execute after registerElement() and localPositionObservable.subscribe().
		context.layout.recalculate()
		return nil
	}))

	var offDocumentKeydown func() = nil
	vue.onUnmounted.Invoke(js.FuncOf(func(this js.Value, args []js.Value) any {
		if offDocumentKeydown != nil {
			offDocumentKeydown()
		}
		return nil
	}))

	if context.expressorContext.focus.FocusedNode() == node {
		offDocumentKeydown = context.expressorContext.documentKeydown.On(func(event js.Value) {
			onDocumentKeydown(context, node, event, nodePickerRef, nodePickerQueryRef, nodePickerVisibleRef, nodePickerChoicesRef)
		})
	}

	focusedSignal, unfocusedSignal := context.expressorContext.focus.Register(node)
	offFocusedSignal := focusedSignal.On(func() {
		isFocusedRef.Set("value", true)

		// When this node is focused, allow the user to open and close the node picker.
		// We assume that offDocumentKeydown will be called when this node gets unfocused; therefore, this won't get
		// subscribed multiple times.
		offDocumentKeydown = context.expressorContext.documentKeydown.On(func(event js.Value) {
			onDocumentKeydown(context, node, event, nodePickerRef, nodePickerQueryRef, nodePickerVisibleRef, nodePickerChoicesRef)
		})
	})
	offUnfocusedSignal := unfocusedSignal.On(func() {
		isFocusedRef.Set("value", false)
		nodePickerVisibleRef.Set("value", false)

		// We don't expect it to ever be nil here, but we'll guard anyway.
		if offDocumentKeydown != nil {
			offDocumentKeydown()
		}
	})
	vue.onUnmounted.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		context.expressorContext.focus.Unregister(node)
		offFocusedSignal()
		offUnfocusedSignal()
		return nil
	}))

	offChildrenChanged := node.GetChildrenChanged().On(func() {
		childrenRef.Set("value", getNodeChildren(node, vue, context))
	})
	vue.onUnmounted.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		offChildrenChanged()
		return nil
	}))

	return ret
}

func getNodePickerChoices(context attributeContext, node ast.Node, query string) js.Value {
	nodePickerChoices := makeEmptyArray()
	if query == "" {
		return nodePickerChoices
	}

	if number64, err := strconv.ParseFloat(query, 32); err == nil {
		nodeChoice := makeEmptyObject()
		nodeChoice.Set("text", query)
		nodeChoice.Set("commitFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			newNode := ast.NewNumberNode(ast.Float(number64))
			ast.Replace(node, newNode)
			context.expressorContext.focus.SetFocusedNode(newNode)
			app.OnEdit()
			return nil
		}))
		// This will need to be changed to support multiple node choices.
		nodePickerChoices.SetIndex(0, nodeChoice)
	}

	for _, function := range ast.GetPrimitiveFunctions() {
		if !strings.Contains(strings.ToLower(function.GetName()), strings.ToLower(query)) {
			continue
		}
		function := function
		nodeChoice := makeEmptyObject()
		nodeChoice.Set("text", function.GetName())
		nodeChoice.Set("commitFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			// Assumption: when the replacement happens, this node component will get destroyed, and a new one
			// will get created. The Vue components must use the :key prop for this to work correctly.
			newNode := ast.NewPrimitiveFunctionCallNode(function)
			ast.Replace(node, newNode)
			context.expressorContext.focus.SetFocusedNode(newNode)
			return nil
		}))
		nodePickerChoices.SetIndex(0, nodeChoice)
	}
	return nodePickerChoices
}

// onDocumentKeydown handles keypresses for opening and closing the node picker.
func onDocumentKeydown(context attributeContext, node ast.Node, event js.Value, nodePickerRef js.Value, nodePickerQueryRef js.Value, nodePickerVisibleRef js.Value, nodePickerChoicesRef js.Value) {
	key := event.Get("key").String()

	// This distinguishes regular characters from SHIFT, ENTER, etc.
	isPrintableKey := len(key) == 1
	isFromInput := strings.ToUpper(event.Get("target").Get("tagName").String()) != "INPUT"

	if key == "Escape" {
		nodePickerVisibleRef.Set("value", false)
	} else if isFromInput && isPrintableKey {
		// We need the isFromInput condition even if the corresponding input event's handler called stopPropagation because
		// the keydown event gets processed first.
		nodePickerVisibleRef.Set("value", true)
		nodePickerQueryRef.Set("value", key)
		nodePickerChoicesRef.Set("value", getNodePickerChoices(context, node, key))

		// Vue.nextTick doesn't work here for some reason.
		js.Global().Call("setTimeout", js.FuncOf(func(this js.Value, args []js.Value) any {
			nodePickerRef.Get("value").Call("focus")
			return nil
		}), 0)
	}
}

func getNodeChildren(node ast.Node, vue vue, context attributeContext) js.Value {
	ret := makeEmptyArray()
	for i, child := range node.GetChildren() {
		child := child
		childValue := makeEmptyObject()
		childValue.Set("key", child.GetId())
		childValue.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return setupNode(child, vue, context)
		}))
		ret.SetIndex(i, childValue)
	}
	return ret
}
