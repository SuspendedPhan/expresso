package main

import (
	"strconv"
	"strings"
	"syscall/js"
)

func bootstrapGoModule() {
	setupPrimitiveFunctions()
	goModule := makeObjectValue()

	goModule.Set("setupRootAttribute", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ref := args[0]
		watch := args[1]
		computed := args[2]
		attribute := NewAttribute()
		node := NewNumberNode(10)
		attribute.setRootNode(&node)
		return setupAttribute(attribute, ref, watch, computed)
	}).Value)

	js.Global().Set("GoModule", goModule)
	println("after set")
}

func setupAttribute(a *Attribute, ref js.Value, watch js.Value, computed js.Value) js.Value {
	returnValue := makeObjectValue()
	rootNodeId := ref.Invoke(a.rootNode.getId())
	returnValue.Set("id", a.getId())
	returnValue.Set("rootNodeId", rootNodeId)
	rootNodeSetupFunc := ref.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return setupNode(a.rootNode, ref, watch, computed)
	}))
	returnValue.Set("rootNodeSetupFunc", rootNodeSetupFunc)

	go forever(func() {
		<-a.onRootNodeChanged
		rootNodeId.Set("value", a.rootNode.getId())
	})

	return returnValue
}

func setupNode(node Node, ref js.Value, watch js.Value, computed js.Value) js.Value {
	nodeChoiceQuery := ref.Invoke("")
	nodeChoices := computed.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		nodeChoices := make([]js.Value, 0)
		query := nodeChoiceQuery.Get("value").String()
		if number, err := strconv.ParseFloat(query, 32); err == nil {
			nodeChoice := makeObjectValue()
			nodeChoice.Set("index", 0)
			nodeChoice.Set("text", number)
			nodeChoice.Set("commit", jsBasicFunc(func() {
				numberNode := NewNumberNode(float(number))
				replace(node, &numberNode)
			}))
			nodeChoices = append(nodeChoices, nodeChoice)
		}

		for _, function := range primitiveFunctions {
			if strings.Contains(strings.ToLower(function.name), strings.ToLower(query)) {
				nodeChoices = append(nodeChoices, getNodeChoiceForPrimitiveFunction(function, node))
			}
		}

		returnValue := makeEmptyArray()
		for i, choice := range nodeChoices {
			choice.Set("index", i)
			returnValue.SetIndex(i, choice)
		}
		return returnValue
	}))

	childDatas := ref.Invoke(getChildDatas(node, ref, watch, computed))

	go forever(func() {
		<-node.getOnChildReplaced()
		println("onChildReplaced")
		childDatas.Set("value", getChildDatas(node, ref, watch, computed))
	})

	returnValue := makeObjectValue()
	returnValue.Set("id", node.getId())
	returnValue.Set("text", node.getText())
	returnValue.Set("nodeChoices", nodeChoices)
	returnValue.Set("nodeChoiceQuery", nodeChoiceQuery)
	returnValue.Set("children", childDatas)

	return returnValue
}

func makeArray(elements []js.Value) js.Value {
	array := makeEmptyArray()
	for i, element := range elements {
		array.SetIndex(i, element)
	}
	return array
}

func getChildDatas(node Node, ref js.Value, watch js.Value, computed js.Value) js.Value {
	childDatas := makeEmptyArray()
	for i, child := range node.getChildren() {
		childData := getChildData(child, ref, watch, computed)
		childDatas.SetIndex(i, childData)
	}
	return childDatas
}

func getChildData(childNode Node, ref js.Value, watch js.Value, computed js.Value) js.Value {
	childData := makeObjectValue()
	childData.Set("id", childNode.getId())
	childData.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return setupNode(childNode, ref, watch, computed)
	}))
	return childData
}

func getNodeChoiceForPrimitiveFunction(function *PrimitiveFunction, nodeToReplace Node) js.Value {
	nodeChoice := makeObjectValue()
	nodeChoice.Set("text", function.name)
	nodeChoice.Set("commit", jsBasicFunc(func() {
		newNode := NewPrimitiveFunctionCallNode(function)
		replace(nodeToReplace, newNode)
	}))
	return nodeChoice
}

func jsBasicFunc(f func()) interface{} {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		f()
		return js.Undefined()
	})
}

func forever(f func()) {
	for {
		f()
	}
}

func makeEmptyArray() js.Value {
	return js.ValueOf([]interface{}{})
}

func makeObjectValue() js.Value {
	return js.ValueOf(make(map[string]interface{}))
}
