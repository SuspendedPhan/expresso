package ast

type Value = Float

type EvalContext struct {
	argumentValueByParameter map[*FunctionParameter]Value
}

func NewEvalContext() *EvalContext {
	return &EvalContext{argumentValueByParameter: make(map[*FunctionParameter]Value)}
}
