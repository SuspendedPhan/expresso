package wasm

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
