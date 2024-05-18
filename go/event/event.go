package event

type subscriber struct {
	callback func(arg interface{})
}

// Event is an interface for Dispatcher that only allows for subscription, and not dispatch.
type Event interface {
	// On subscribes to this signal. The returned off function must be called the subscription is no longer needed,
	// otherwise there will be a memory leak.
	On(callback func(arg interface{})) (off func())
}

// Dispatcher is an event dispatcher. NewDispatcher() should be called to create a dispatcher. Consider making this
// struct generic if you need to create another typed version of this, similar to JsEvent.
type Dispatcher struct {
	subscribers map[*subscriber]struct{}
}

// On subscribes to this signal. The returned off function must be called the subscription is no longer needed,
// otherwise there will be a memory leak.
func (sig *Dispatcher) On(callback func(arg interface{})) (off func()) {
	sub := &subscriber{
		callback: callback,
	}
	sig.subscribers[sub] = struct{}{}
	return func() {
		delete(sig.subscribers, sub)
	}
}

// Dispatch dispatches an event to all of this Dispatcher's subscribers with the given argument.
func (sig Dispatcher) Dispatch(arg interface{}) {
	for subscriber := range sig.subscribers {
		subscriber.callback(arg)
	}
}

func NewDispatcher() *Dispatcher {
	return &Dispatcher{subscribers: make(map[*subscriber]struct{})}
}
