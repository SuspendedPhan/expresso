package main

import (
	"syscall/js"

	"expressioni.sta/evaluator"
)

func createEvaluator(this js.Value, args []js.Value) js.Value {
	arg := args[0]
	e := newEvaluator(arg)

	ret := makeEmptyObject()
	ret.Set("eval", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		r := e.Eval()
		return EvalResultToJsValue(r)
	}))
	return ret
}

func newEvaluator(value js.Value) *evaluator.Evaluator {
	return &evaluator.Evaluator{
		NumberExpr: newNumberExpr(value),
	}
}

func newNumberExpr(value js.Value) *evaluator.NumberExpr {
	return &evaluator.NumberExpr{
		Value: value.Call("getValue").Float(),
	}
}
