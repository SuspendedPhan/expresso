package ast

// TODO: use Event under the hood.

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
	subscribers map[*Subscriber]struct{}
}

// On subscribes to this signal. The returned off function must be called the subscription is no longer needed,
// otherwise there will be a memory leak.
func (sig *Signal) On(callback func()) (off func()) {
	subscriber := &Subscriber{
		callback: callback,
	}
	sig.subscribers[subscriber] = struct{}{}
	return func() {
		delete(sig.subscribers, subscriber)
	}
}

func (sig Signal) Dispatch() {
	for subscriber := range sig.subscribers {
		subscriber.callback()
	}
}

func NewSignal() *Signal {
	return &Signal{subscribers: make(map[*Subscriber]struct{})}
}
