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
	expr := toExpr(value)

	return &evaluator.Evaluator{
		Expr: expr,
	}
}

func toExpr(jsValue js.Value) evaluator.Expr {
	switch jsValue.Call("getExprType").String() {
	case "Number":
		return toNumberExpr(jsValue)
	case "PrimitiveFunctionCall":
		return toPrimitiveFunctionCallExpr(jsValue)
	}
	return nil
}

func toNumberExpr(jsValue js.Value) *evaluator.NumberExpr {
	return &evaluator.NumberExpr{
		Value: jsValue.Call("getValue").Float(),
	}
}

func toPrimitiveFunctionCallExpr(jsValue js.Value) *evaluator.PrimitiveFunctionCallExpr {
	argExprs := PrimitiveFunctionCallExpr{jsValue: jsValue}.getArgs()
	args := make([]evaluator.Expr, argExprs.Length())
	for i := 0; i < argExprs.Length(); i++ {
		args[i] = toExpr(argExprs.Index(i))
	}
	return &evaluator.PrimitiveFunctionCallExpr{
		FunctionId: jsValue.Get("functionId").String(),
		Args:       args,
	}
}
