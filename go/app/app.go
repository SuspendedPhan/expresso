package app

import (
	"expressioni.sta/ast"
	"expressioni.sta/ast/dehydrated"
)

var rootOrganisms = make([]*ast.Organism, 0)
var dehydratedOrganisms = make([]*dehydrated.Organism, 0)

func GetRootOrganisms() []*ast.Organism {
	return rootOrganisms
}

func OnEdit() {
	// Dehydrate all root organisms
	dehydratedOrganisms = make([]*dehydrated.Organism, 0)
	for _, rootOrganism := range rootOrganisms {
		dehydratedOrganisms = append(dehydratedOrganisms, dehydrated.DehydrateOrganism(*rootOrganism))
	}
}