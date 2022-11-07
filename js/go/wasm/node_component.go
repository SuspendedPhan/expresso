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

func setupNode(node ast.Node, vue vue) js.Value {
	ret := makeEmptyObject()
	ret.Set("text", node.GetText())
	nodeChoicesRef := vue.ref.Invoke()
	nodeChoicesRef.Set("value", makeEmptyArray())
	nodeChoiceQueryRef := vue.ref.Invoke()
	nodeChoiceQueryRef.Set("value", "")

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
	return ret

	nodeChoicesChan := make(chan []js.Value)
	childrenChan := make(chan []js.Value)
	nodeChoiceQueryChan := make(chan string)

	component := NodeComponent{
		Component: Component{
			Id:        node.GetId(),
			SetupFunc: nil,
		},
		Text:            node.GetText(),
		NodeChoiceQuery: StringRef{nodeChoiceQueryChan},
		NodeChoices:     ArrayRef{nodeChoicesChan},
		Children:        ArrayRef{childrenChan},
		OnNodeChoiceQueryInput: func(event js.Value) {
			query := event.Get("target").Get("value").String()
			nodeChoices := make([]*NodeChoice, 0)
			if number64, err := strconv.ParseFloat(query, 32); err == nil {
				number := ast.Float(number64)
				nodeChoice := &NodeChoice{
					Text: ast.NumberToString(number),
					CommitFunc: func() {
						numberNode := ast.NewNumberNode(number)
						ast.Replace(node, numberNode)
					},
				}
				nodeChoices = append(nodeChoices, nodeChoice)
			}

			for _, function := range ast.PrimitiveFunctions {
				if !strings.Contains(strings.ToLower(function.GetName()), strings.ToLower(query)) {
					continue
				}
				function := function
				nodeChoice := &NodeChoice{
					Text: function.GetName(),
					CommitFunc: func() {
						newNode := ast.NewPrimitiveFunctionCallNode(function)
						ast.Replace(node, newNode)
					},
				}
				nodeChoices = append(nodeChoices, nodeChoice)
			}

			for i, choice := range nodeChoices {
				choice.Index = i
			}

			elements := make([]js.Value, 0)
			for _, choice := range nodeChoices {
				elements = append(elements, toJsValue(choice, vue))
			}

			nodeChoicesChan <- elements
			nodeChoiceQueryChan <- query
		},
	}

	go func() {
		childrenChan <- getNodeChildren(node, vue)
	}()

	go forever(func() {
		<-node.GetOnChildReplaced()
		childrenChan <- getNodeChildren(node, vue)
	})

	return toJsValue(component, vue)
}

func getNodeChildren(node ast.Node, vue vue) []js.Value {
	elements := make([]js.Value, 0)
	for _, child := range node.GetChildren() {
		child := child
		childComponent := Component{
			Id: child.GetId(),
			SetupFunc: func() js.Value {
				return setupNode(child, vue)
			},
		}
		elements = append(elements, toJsValue(childComponent, vue))
	}
	return elements
}
