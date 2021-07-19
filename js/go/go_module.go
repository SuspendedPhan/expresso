package main

import (
	"syscall/js"
)

type ObjectMap = map[string]interface{}

type GoNode struct {
	id             int
	child          *GoNode
	onChildChanged chan struct{}
}

var id = 0

func (n *GoNode) replaceChild() {
	child := NewNode()
	n.child = &child
	n.onChildChanged <- struct{}{}
}

func NewNode() GoNode {
	node := GoNode{id: id, onChildChanged: make(chan struct{})}
	id++
	return node
}

func bootstrapGoModule() {
	goModule := makeObjectValue()

	goModule.Set("setupRootNode", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ref := args[0]
		node := NewNode()
		return setupNode(&node, ref)
	}).Value)

	js.Global().Set("GoModule", goModule)
	println("after set")
}

func setupNode(node *GoNode, ref js.Value) js.Value {
	child := ref.Invoke(js.Null())
	replaceChild := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		println("replaceChild")
		node.replaceChild()
		return js.Undefined()
	}).Value

	returnValue := makeObjectValue()
	returnValue.Set("id", node.id)
	returnValue.Set("child", child)
	returnValue.Set("replaceChild", replaceChild)

	go forever(func() {
		println("goroutine started")
		<-node.onChildChanged
		println("goroutine received")
		if node.child == nil {
			child.Set("value", js.Null())
		} else {
			childData := makeObjectValue()
			childData.Set("id", node.child.id)
			childData.Set("setupFunc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				return setupNode(node.child, ref)
			}))
			child.Set("value", childData)
		}
	})

	return returnValue
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
	return js.ValueOf(make(ObjectMap))
}
