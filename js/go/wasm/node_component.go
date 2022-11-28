package main

import (
	"expressioni.sta/ast"
	"strconv"
	"strings"
	"syscall/js"
)

type NodeComponent struct {
	Component
	Text                   string
	NodeChoiceQuery        StringRef
	NodeChoices            ArrayRef
	Children               ArrayRef
	OnNodeChoiceQueryInput func(event js.Value)
}

type NodeChoice struct {
	Index      int
	Text       string
	CommitFunc func()
}

func setupNode(node ast.Node, vue vue, context attributeContext) js.Value {
	ret := makeEmptyObject()
	nodeChoicesRef := vue.ref.Invoke()
	nodeChoicesRef.Set("value", makeEmptyArray())
	nodeChoiceQueryRef := vue.ref.Invoke()
	nodeChoiceQueryRef.Set("value", "")
	childrenRef := vue.ref.Invoke()
	childrenRef.Set("value", getNodeChildren(node, vue, context))
	positionRef := vue.ref.Invoke()
	positionRef.Set("value", makeEmptyObject())
	positionRef.Get("value").Set("left", 0)
	positionRef.Get("value").Set("top", 0)
	rootElementRef := vue.ref.Invoke()

	// key: string | The ID of this node. Used for the Vue special :key prop.
	ret.Set("key", node.GetId())

	// text: string | The display text for this node.
	ret.Set("text", node.GetText())

	// children: []{ id: string, setupFunc: function }
	ret.Set("children", childrenRef)

	// nodeChoices is an array of options for the user to replace this node with another node based on the query given to
	// onNodeChoiceQueryInput. Each element is an object with the following keys:
	// - text: string | The display text for the node choice.
	// - commitFunc: function | A function to replace this node with the chosen node.
	ret.Set("nodeChoices", nodeChoicesRef)

	// nodeChoiceQuery is a readonly ref that reflects the argument passed to onNodeChoiceQueryInput.
	ret.Set("nodeChoiceQuery", vue.readonly.Invoke(nodeChoiceQueryRef))

	// onNodeChoiceQueryInput is called when the user types input into the node choice text box.
	// args[0] | text: string | The full input.
	ret.Set("onNodeChoiceQueryInput", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		query := args[0].Get("target").Get("value").String()

		nodeChoices := makeEmptyArray()
		if number64, err := strconv.ParseFloat(query, 32); err == nil {
			nodeChoice := makeEmptyObject()
			nodeChoice.Set("text", query)
			nodeChoice.Set("commitFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				ast.Replace(node, ast.NewNumberNode(ast.Float(number64)))
				return nil
			}))
			// This will need to be changed to support multiple node choices.
			nodeChoices.SetIndex(0, nodeChoice)
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
				return nil
			}))
			nodeChoices.SetIndex(0, nodeChoice)
		}

		nodeChoicesRef.Set("value", nodeChoices)
		nodeChoiceQueryRef.Set("value", query)
		return nil
	}))

	// position: { top: number, left: number } | The local position of the node based on layout calculation.
	ret.Set("position", vue.readonly.Invoke(positionRef))

	// rootElement: element ref | The HTML element that will be used to determine the size of the component for layout purposes.
	ret.Set("rootElement", rootElementRef)

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

	offChildrenChanged := node.GetChildrenChanged().On(func() {
		childrenRef.Set("value", getNodeChildren(node, vue, context))
	})
	vue.onUnmounted.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		offChildrenChanged()
		return nil
	}))

	return ret
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
