package ast

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestSignal(t *testing.T) {
	signal := NewSignal()
	called := false
	signal.On(func() {
		called = true
	})
	signal.Dispatch()
	assert.True(t, called)
}
