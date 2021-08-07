package ast

type Subscriber struct {
	channel chan struct{}
	functor func()
}

type Signal struct {
	subscribers map[*Subscriber]*Subscriber
}

func (sig *Signal) On(callback func()) (off func()) {
	subscriber := &Subscriber{
		channel: make(chan struct{}),
		functor: callback,
	}
	sig.subscribers[subscriber] = subscriber
	return func() {
		delete(sig.subscribers, subscriber)
	}
}

func (sig Signal) dispatch() {
	for subscriber := range sig.subscribers {
		subscriber := subscriber
		go func() {
			subscriber.channel <- struct{}{}
		}()
	}
}

func NewSignal() *Signal {
	return &Signal{subscribers: map[*Subscriber]*Subscriber{}}
}
