package ast

import "expressioni.sta/common"

type PrimitiveFunctionParameter struct {
	common.Name
}

type FunctionParameter struct {
	common.Name
	function *Function
}
