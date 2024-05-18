package event

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestEvent(t *testing.T) {
	signal := NewDispatcher()
	called := false
	result := -1
	signal.On(func(arg interface{}) {
		result = arg.(int)
		called = true
	})
	signal.Dispatch(10)
	assert.True(t, called)
	assert.Equal(t, 10, result)
}
