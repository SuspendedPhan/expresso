package main

import (
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

func setupNode(node Node, vue vue) js.Value {
	nodeChoicesChan := make(chan []js.Value)
	childrenChan := make(chan []js.Value)
	nodeChoiceQueryChan := make(chan string)

	component := NodeComponent{
		Component: Component{
			Id:        node.getId(),
			SetupFunc: nil,
		},
		Text:            node.getText(),
		NodeChoiceQuery: StringRef{nodeChoiceQueryChan},
		NodeChoices:     ArrayRef{nodeChoicesChan},
		Children:        ArrayRef{childrenChan},
		OnNodeChoiceQueryInput: func(event js.Value) {
			query := event.Get("target").Get("value").String()
			nodeChoices := make([]*NodeChoice, 0)
			if number64, err := strconv.ParseFloat(query, 32); err == nil {
				number := float(number64)
				nodeChoice := &NodeChoice{
					Text: numberToString(number),
					CommitFunc: func() {
						numberNode := NewNumberNode(number)
						replace(node, &numberNode)
					},
				}
				nodeChoices = append(nodeChoices, nodeChoice)
			}

			for _, function := range primitiveFunctions {
				if !strings.Contains(strings.ToLower(function.name), strings.ToLower(query)) {
					continue
				}
				function := function
				nodeChoice := &NodeChoice{
					Text: function.name,
					CommitFunc: func() {
						newNode := NewPrimitiveFunctionCallNode(function)
						replace(node, newNode)
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
		<-node.getOnChildReplaced()
		childrenChan <- getNodeChildren(node, vue)
	})

	return toJsValue(component, vue)
}

func getNodeChildren(node Node, vue vue) []js.Value {
	elements := make([]js.Value, 0)
	for _, child := range node.getChildren() {
		child := child
		childComponent := Component{
			Id: child.getId(),
			SetupFunc: func() js.Value {
				return setupNode(child, vue)
			},
		}
		elements = append(elements, toJsValue(childComponent, vue))
	}
	return elements
}
