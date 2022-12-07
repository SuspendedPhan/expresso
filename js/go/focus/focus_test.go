package focus

import (
	"expressioni.sta/ast"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestFocus(t *testing.T) {
	focus := NewFocus()
	a := ast.NewNumberNode(10)
	b := ast.NewNumberNode(20)
	focus.SetFocusedNode(a)
	assert.Error(t, err)

	aFocused, aUnfocused := focus.Register(a)
	aFocusedCount := 0
	aUnfocusedCount := 0
	bFocused, bUnfocused := focus.Register(b)
	bFocusedCount := 0
	bUnfocusedCount := 0
	aFocused.On(func() {
		aFocusedCount++
	})
	aUnfocused.On(func() {
		aUnfocusedCount++
	})
	bFocused.On(func() {
		bFocusedCount++
	})
	bUnfocused.On(func() {
		bUnfocusedCount++
	})
	focus.SetFocusedNode(a)
	assert.NoError(t, err)
	assert.Equal(t, 1, aFocusedCount)
	assert.Equal(t, 0, aUnfocusedCount)
	assert.Equal(t, 0, bFocusedCount)
	assert.Equal(t, 0, bUnfocusedCount)

	focus.SetFocusedNode(b)
	assert.NoError(t, err)
	assert.Equal(t, 1, aFocusedCount)
	assert.Equal(t, 1, aUnfocusedCount)
	assert.Equal(t, 1, bFocusedCount)
	assert.Equal(t, 0, bUnfocusedCount)
}
