package ast

import "expressionista/common"

type PrimitiveFunctionParameter struct {
	common.Name
}

type FunctionParameter struct {
	common.Name
	function *Function
}
