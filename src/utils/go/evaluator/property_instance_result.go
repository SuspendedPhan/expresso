package evaluator

type PropertyInstanceResult struct {
	Path  *PropertyInstancePath
	Value DexValue
}

func (p *PropertyInstanceResult) String() string {
	return p.Path.String() + " = " + floatToString(p.Value)
}
