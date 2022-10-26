package ast

type Subscriber struct {
	callback func()
}

type Signal struct {
	subscribers map[*Subscriber]struct{}
}

func (sig *Signal) On(callback func()) (off func()) {
	subscriber := &Subscriber{
		callback: callback,
	}
	sig.subscribers[subscriber] = struct{}{}
	return func() {
		delete(sig.subscribers, subscriber)
	}
}

func (sig Signal) dispatch() {
	for subscriber := range sig.subscribers {
		subscriber.callback()
	}
}

func NewSignal() *Signal {
	return &Signal{subscribers: make(map[*Subscriber]struct{})}
}
