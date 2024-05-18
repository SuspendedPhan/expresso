package main

import (
	"expressioni.sta/ast"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestSetupOrganismAddChild(t *testing.T) {
	org := ast.NewOrganism()
	gueOrg := setupOrganism(org, mockVue(), mockExpressorContext(), mockElementLayout())
	assert.Equal(t, 0, len(org.Suborganisms))
	assert.Equal(t, 0, gueOrg.Get("children").Get("value").Length())

	gueOrg.Call("addChildOrganism")
	assert.Equal(t, 1, len(org.Suborganisms))
	assert.Equal(t, 1, gueOrg.Get("children").Get("value").Length())
}

func TestRemoveOrganism(t *testing.T) {
	t.SkipNow()
	parent := ast.NewOrganism()
	child := ast.NewOrganism()
	parent.AddSuborganism(child)
	orgs := make([]*ast.Organism, 0)
	orgs = append(orgs, parent)
	vu := mockVue()
	expressor := setupExpressor(vu, &orgs)
	gueParent := expressor.Get("rootOrganisms").Get("value").Index(0).Call("setupFunc")
	gueChild := gueParent.Get("children").Get("value").Index(0).Call("setupFunc")
	gueChild.Call("remove")
	assert.Equal(t, 0, gueParent.Get("children").Get("value").Length())
	gueParent.Call("remove")
	assert.Equal(t, 0, expressor.Get("rootOrganisms").Get("value").Length())
}
