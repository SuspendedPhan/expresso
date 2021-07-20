package main

import (
	"strconv"
	"syscall/js"
)

func bootstrapGoModule() {
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
		println("waiting for root node changed")
		<-a.onRootNodeChanged
		println("root node changed")
		rootNodeId.Set("value", a.rootNode.getId())
	})

	return returnValue
}

func setupNode(node Node, ref js.Value, watch js.Value, computed js.Value) js.Value {
	nodeChoiceQuery := ref.Invoke("")
	nodeChoices := computed.Invoke(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		returnValue := makeArrayValue()
		query := nodeChoiceQuery.Get("value")
		if number, err := strconv.ParseFloat(query.String(), 32); err == nil {
			nodeChoice := makeObjectValue()
			nodeChoice.Set("index", 0)
			nodeChoice.Set("text", number)
			nodeChoice.Set("commit", jsBasicFunc(func() {
				numberNode := NewNumberNode(float32(number))
				replace(node, &numberNode)
			}))
			returnValue.SetIndex(0, nodeChoice)
		}
		return returnValue
	}))

	returnValue := makeObjectValue()
	returnValue.Set("id", node.getId())
	returnValue.Set("text", node.getText())
	returnValue.Set("nodeChoices", nodeChoices)
	returnValue.Set("nodeChoiceQuery", nodeChoiceQuery)

	return returnValue
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

func makeArrayValue() js.Value {
	return js.ValueOf([]interface{}{})
}

func makeObjectValue() js.Value {
	return js.ValueOf(make(map[string]interface{}))
}
