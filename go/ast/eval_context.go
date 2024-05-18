package ast

type Value = Float

type EvalContext struct {
	argumentValueByParameter map[*FunctionParameter]Value
	valueByExternalAttribute map[*ExternalAttribute]Value
	cloneNumberByOrganism    map[*Organism]Float
}

func NewEvalContext() *EvalContext {
	return &EvalContext{
		argumentValueByParameter: make(map[*FunctionParameter]Value),
		valueByExternalAttribute: make(map[*ExternalAttribute]Value),
		cloneNumberByOrganism:    make(map[*Organism]Float),
	}
}
