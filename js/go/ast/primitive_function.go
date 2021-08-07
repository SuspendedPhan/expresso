package ast

import "expressionista/common"

var PrimitiveFunctions = map[string]*PrimitiveFunction{}

type PrimitiveFunction struct {
	common.Name
	parameters  []*Parameter
	evalFunctor func(args []float32) float32
}

func SetupPrimitiveFunctions() {
	addPrimitiveFunction("+", []string{"a", "b"}, func(args []float32) float32 {
		return args[0] + args[1]
	})

	addPrimitiveFunction("-", []string{"a", "b"}, func(args []float32) float32 {
		return args[0] - args[1]
	})

	addPrimitiveFunction("*", []string{"a", "b"}, func(args []float32) float32 {
		return args[0] * args[1]
	})

	addPrimitiveFunction("/", []string{"a", "b"}, func(args []float32) float32 {
		return args[0] / args[1]
	})
}

func addPrimitiveFunction(name string, parameterNames []string, evalFunctor func(args []float32) float32) {
	function := PrimitiveFunction{
		evalFunctor: evalFunctor,
	}
	function.SetName(name)
	for _, parameterName := range parameterNames {
		function.parameters = append(function.parameters, &Parameter{common.Name{parameterName}})
	}
	PrimitiveFunctions[name] = &function
}
