package main

import (
	"syscall/js"
)

func funcOf(fun func()) js.Func {
	of := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fun()
		return js.Undefined()
	})
	return of
}

func funcOfReturn(fun func() js.Value) js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return fun()
	})
}

func funcOfArgs(fun func(args []js.Value)) js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fun(args)
		return js.Undefined()
	})
}

func funcOfArgsReturn(fun func(args []js.Value) js.Value) js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return fun(args)
	})
}
