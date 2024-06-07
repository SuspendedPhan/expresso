package main

import (
	"fmt"
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
		return toNumberExpr(NumberExpr{jsValue: jsValue})
	case "PrimitiveFunctionCall":
		return toPrimitiveFunctionCallExpr(PrimitiveFunctionCallExpr{jsValue: jsValue})
	}
	return nil
}

func toNumberExpr(n NumberExpr) *evaluator.NumberExpr {
	return &evaluator.NumberExpr{
		Value: n.getValue(),
	}
}

func toPrimitiveFunctionCallExpr(p PrimitiveFunctionCallExpr) *evaluator.PrimitiveFunctionCallExpr {
	fmt.Println("toPrimitiveFunctionCallExpr")
	argExprs := p.getArgs()
	args := make([]evaluator.Expr, argExprs.Length())
	for i := 0; i < argExprs.Length(); i++ {
		args[i] = toExpr(argExprs.Index(i))
	}
	return &evaluator.PrimitiveFunctionCallExpr{
		Args: args,
	}
}
