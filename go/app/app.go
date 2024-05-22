package app

import (
	"fmt"

	"expressioni.sta/ast"
	"expressioni.sta/ast/dehydrated"
	"gopkg.in/yaml.v3"
)

var rootOrganisms = make([]*ast.Organism, 0)
var dehydratedOrganisms = make([]*dehydrated.Organism, 0)

func GetRootOrganisms() *[]*ast.Organism {
	return &rootOrganisms
}

func OnEdit() {
	// Dehydrate all root organisms
	dehydratedOrganisms = make([]*dehydrated.Organism, 0)
	for _, rootOrganism := range rootOrganisms {
		dehydratedOrganisms = append(dehydratedOrganisms, dehydrated.DehydrateOrganism(*rootOrganism))
	}
	fmt.Println("Dehydrated organisms: ", dehydratedOrganisms)
	fmt.Println("rootOrganisms: ", rootOrganisms)

	// Now convert dehydrated organisms to yaml
	attr := dehydratedOrganisms[0].IntrinsicAttributeByProtoAttributeId["ec211cbf-9173-4f8a-be43-01db9cd1b29a"]
	// n := attr.RootNode
	// nn := n.(*dehydrated.NumberNode)
	a, err := yaml.Marshal(attr)
	if err != nil {
		fmt.Println("Error: ", err)
	}
	fmt.Println(string(a))
}
