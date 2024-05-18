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

func TestSetupExpressorElementLayout(t *testing.T) {
	js.Global().Set("document", makeEmptyObject())
	js.Global().Get("document").Set("addEventListener", js.FuncOf(func(this js.Value, args []js.Value) any {
		return nil
	}))
	orgs := make([]*ast.Organism, 0)
	vu := mockVue()
	expressor := setupExpressor(vu, &orgs)
	rootOrgs := expressor.Get("rootOrganisms")
	expressor.Call("addOrganism")
	layout := rootOrgs.Get("value").Index(0).Get("elementLayout")
	assert.False(t, layout.IsUndefined())
	assert.False(t, layout.Get("registerElement").IsUndefined())

	regElInvokedArg0 := make([]js.Value, 0)
	regElInvokedArg1 := make([]js.Value, 0)
	layout.Set("registerElement", js.FuncOf(func(this js.Value, args []js.Value) any {
		regElInvokedArg0 = append(regElInvokedArg0, args[0])
		regElInvokedArg1 = append(regElInvokedArg1, args[1])
		return nil
	}))

	org := rootOrgs.Get("value").Index(0).Call("setupFunc")
	assert.Len(t, regElInvokedArg1, 1)
	assert.Equal(t, org.Get("id").String(), regElInvokedArg1[0].String())
}

func TestNewOrganismAddsToOrgIdMap(t *testing.T) {
	context := mockExpressorContext()
	org := newOrganism(context)
	_, ok := context.organismIdToOrganism[org.GetId()]
	assert.True(t, ok)
}
