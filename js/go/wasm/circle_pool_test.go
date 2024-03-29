package main

import (
	"github.com/stretchr/testify/assert"
	"syscall/js"
	"testing"
)

func TestPixiPool(t *testing.T) {
	jsPool := makeEmptyObject()
	jsPool.Set("use", js.FuncOf(func(this js.Value, args []js.Value) any {
		return makeEmptyObject()
	}))

	usedCircle := js.Value{}
	wasRecycleCalled := false
	jsPool.Set("recycle", js.FuncOf(func(this js.Value, args []js.Value) any {
		assert.Equal(t, usedCircle, args[0])
		wasRecycleCalled = true
		return nil
	}))
	pool := newPixiPool(jsPool)
	usedCircle = pool.use()
	pool.recycleAll()
	assert.True(t, wasRecycleCalled)
}
