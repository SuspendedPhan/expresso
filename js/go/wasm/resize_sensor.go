package main

import "syscall/js"

// onElementResized is used to detect when an HTML element changes size. It returns an unsubscribe function, which
// must be called to free memory when the listener is no longer needed.
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
