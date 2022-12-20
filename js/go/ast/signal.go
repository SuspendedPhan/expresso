package ast

import "expressioni.sta/event"

type Subscriber struct {
	callback func()
}

// ReadonlySignal is an interface for Signal that only allows for subscription, and not dispatch.
type ReadonlySignal interface {
	// On subscribes to this signal. The returned off function must be called the subscription is no longer needed,
	// otherwise there will be a memory leak.
	On(callback func()) (off func())
}

// Signal is an event dispatcher. NewSignal() should be called to create a signal.
type Signal struct {
	dispatcher *event.Dispatcher
}

// On subscribes to this signal. The returned off function must be called the subscription is no longer needed,
// otherwise there will be a memory leak.
func (sig *Signal) On(callback func()) (off func()) {
	return sig.dispatcher.On(func(arg interface{}) {
		callback()
	})
}

func (sig *Signal) Dispatch() {
	sig.dispatcher.Dispatch(struct{}{})
}

func NewSignal() *Signal {
	return &Signal{dispatcher: event.NewDispatcher()}
}
