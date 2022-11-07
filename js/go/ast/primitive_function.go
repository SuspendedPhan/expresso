package ast

import "expressioni.sta/common"

// Deprecated: Use GetPrimitiveFunctions.
var PrimitiveFunctions = map[string]*PrimitiveFunction{}

type PrimitiveFunction struct {
	common.Name
	parameters  []*PrimitiveFunctionParameter
	evalFunctor func(args []float32) float32
}

func GetPrimitiveFunctions() map[string]*PrimitiveFunction {
	if len(PrimitiveFunctions) == 0 {
		SetupPrimitiveFunctions()
	}
	return PrimitiveFunctions
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
		parameters:  make([]*PrimitiveFunctionParameter, 0),
	}
	function.SetName(name)
	for _, parameterName := range parameterNames {
		function.parameters = append(function.parameters, &PrimitiveFunctionParameter{common.Name{Name: parameterName}})
	}
	PrimitiveFunctions[name] = &function
}
