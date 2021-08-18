package ast

import "expressionista/hydration"

func RegisterPolymorphs(p *hydration.PolymorphRegistry) {
	p.Register(NumberNode{}, "f6261e46-ca56-4bfa-93ad-a14a3e1b3f05")
	p.Register(Attribute{}, "34db48e1-03bf-40ef-a7b0-d2cfb7185bf4")
}
