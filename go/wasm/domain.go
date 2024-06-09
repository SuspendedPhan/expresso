package main

import "syscall/js"

type NumberExpr struct {
	jsValue js.Value
}

type PrimitiveFunctionCallExpr struct {
	jsValue js.Value
}

func (n NumberExpr) getValue() float64 {
	return n.jsValue.Call("getValue").Float()
}

func (p PrimitiveFunctionCallExpr) getArgs() js.Value {
	return p.jsValue.Call("getArgs")
}

type Observable struct {
	jsValue js.Value
}

func (o Observable) Subscribe(f func(this js.Value, args []js.Value)) {
	return o.jsValue.Call("subscribe", js.FuncOf(f))
}
