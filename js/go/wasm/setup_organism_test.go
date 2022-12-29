package main

import (
	"expressioni.sta/ast"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestSetupOrganismAddChild(t *testing.T) {
	org := ast.NewOrganism()
	gueOrg := setupOrganism(org, mockVue(), mockExpressorContext())
	assert.Equal(t, 0, len(org.Suborganisms))
	assert.Equal(t, 0, gueOrg.Get("children").Get("value").Length())

	gueOrg.Call("addChildOrganism")
	assert.Equal(t, 1, len(org.Suborganisms))
	assert.Equal(t, 1, gueOrg.Get("children").Get("value").Length())
}
