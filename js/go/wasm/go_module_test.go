package main

import (
	"github.com/stretchr/testify/assert"
	"syscall/js"
	"testing"
)

func TestSimple(t *testing.T) {
	expressor := setupExpressor(mockVue())
	length := expressor.Get("rootOrganisms").Get("value").Get("length").Int()
	assert.Equal(t, 0, length)

	expressor.Get("addOrganism").Invoke()
	length = expressor.Get("rootOrganisms").Get("value").Get("length").Int()
	assert.Equal(t, 1, length)
	name := expressor.Get("rootOrganisms").Get("value").Index(0).Get("name").String()
	assert.Equal(t, "organism0", name)

	expressor.Get("addOrganism").Invoke()
	length = expressor.Get("rootOrganisms").Get("value").Get("length").Int()
	assert.Equal(t, 2, length)
	name = expressor.Get("rootOrganisms").Get("value").Index(1).Get("name").String()
	assert.Equal(t, "organism1", name)
}

func mockVue() vue {
	refFunc := js.ValueOf(js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return makeEmptyObject()
	}))
	return vue{
		ref:      refFunc,
		watch:    js.Value{},
		computed: js.Value{},
	}
}
