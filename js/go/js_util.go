package main

import "syscall/js"

func makeArray(elements []js.Value) js.Value {
	array := makeEmptyArray()
	for i, element := range elements {
		array.SetIndex(i, element)
	}
	return array
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
