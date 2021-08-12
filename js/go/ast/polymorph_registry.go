package ast

import "expressionista/hydration"

func RegisterPolymorphs(p *hydration.PolymorphRegistryStruct) {
	p.Register(NumberNode{}, "f6261e46-ca56-4bfa-93ad-a14a3e1b3f05")
}
