package common

import "fmt"

type assertionError struct {
	err error
}

type Handler struct {
	err             *error
	messages        []interface{}
	assertionFailed bool
}

func (h *Handler) Handle() {
	msg := objsToString(h.messages)

	err := h.err
	if *err != nil {
		*err = fmt.Errorf("%v: %v", msg, *err)
	}

	if h.assertionFailed {
		r := recover()
		assertionError, ok := r.(assertionError)
		if !ok {
			panic(fmt.Errorf("expected an assertionError: %v", r))
		}

		if assertionError.err == nil {
			*err = fmt.Errorf("assertion failed: %v", msg)
		} else {
			*err = fmt.Errorf("%v: assertion failed: %v", msg, assertionError.err)
		}
	}
}

func (h *Handler) AssertNilErr(err error) {
	if err != nil {
		h.assertionFailed = true
		panic(assertionError{err: err})
	}
}

func (h *Handler) Assert(condition bool, objs ...interface{}) {
	if !condition {
		h.assertionFailed = true
		if len(objs) == 0 {
			panic(assertionError{})
		} else {
			panic(assertionError{err: fmt.Errorf(objsToString(objs))})
		}
	}
}

func NewHandler(e *error, msgs ...interface{}) *Handler {
	return &Handler{err: e, messages: msgs}
}
