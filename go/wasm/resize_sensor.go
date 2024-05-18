package main

import "syscall/js"

// TODO: document
func onElementResized(resizeSensorClass js.Value, element js.Value, callback func()) (offElementResized func()) {
	sensor := resizeSensorClass.New(element, js.FuncOf(func(this js.Value, args []js.Value) any {
		callback()
		return nil
	}))
	offElementResized = func() {
		sensor.Call("detach")
	}
	return offElementResized
}
