package main

import (
	"expressioni.sta/event"
	"syscall/js"
)

// JsEvent is an interface for JsEventDispatcher that only allows for subscription, and not dispatch.
type JsEvent interface {
	// On subscribes to this signal. The returned off function must be called the subscription is no longer needed,
	// otherwise there will be a memory leak.
	On(callback func(arg js.Value)) (off func())
}

// JsEventDispatcher is an event dispatcher. NewSignal() should be called to create a signal.
type JsEventDispatcher struct {
	dispatcher *event.Dispatcher
}

// On subscribes to this signal. The returned off function must be called the subscription is no longer needed,
// otherwise there will be a memory leak.
func (sig *JsEventDispatcher) On(callback func(arg js.Value)) (off func()) {
	return sig.dispatcher.On(func(arg interface{}) {
		// TODO: check cast and return err? maybe not.. since i'll probably move this to generic
		value, ok := arg.(js.Value)
		if !ok {
			panic("trying to dispatch, cast failed")
		}
		callback(value)
	})
}

func (sig JsEventDispatcher) Dispatch(arg js.Value) {
	sig.dispatcher.Dispatch(arg)
}

func NewJsEventDispatcher() *JsEventDispatcher {
	return &JsEventDispatcher{dispatcher: event.NewDispatcher()}
}
