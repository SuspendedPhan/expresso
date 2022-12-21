package main

import (
	"expressioni.sta/ast"
	"github.com/stretchr/testify/assert"
	"syscall/js"
	"testing"
)

func TestSetupExpressorAddsOrganism(t *testing.T) {
	js.Global().Set("document", makeEmptyObject())
	js.Global().Get("document").Set("addEventListener", js.FuncOf(func(this js.Value, args []js.Value) any {
		return nil
	}))
	orgs := make([]*ast.Organism, 0)
	expressor := setupExpressor(mockVue(), &orgs)
	expressor.Call("addOrganism")
	assert.Equal(t, len(orgs), 1)
}
