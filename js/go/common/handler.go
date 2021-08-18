package common

import (
	"fmt"
)

type assertionError struct {
	err error
}

type Handler struct {
	err             *error
	messages        []interface{}
	assertionFailed bool
}

var recoverEnabled = true

func (h *Handler) Handle() {
	var r interface{} = nil
	if h.assertionFailed && recoverEnabled {
		r = recover()
	}
	h.handle(r)
}

func (h *Handler) HandleCatchPanics() {
	var r interface{} = nil
	if recoverEnabled {
		r = recover()
	}
	h.handle(r)
}

func (h *Handler) handle(recovered interface{}) {
	msg := objsToString(h.messages)

	err := h.err
	if *err != nil {
		*err = fmt.Errorf("%v:\n%v", msg, *err)
	}

	if !recoverEnabled {
		println("recover is disabled")
		return
	}

	if h.assertionFailed {
		assertionError, ok := recovered.(assertionError)
		if !ok {
			panic(fmt.Errorf("expected an assertionError: \n%v", recovered))
		}

		if assertionError.err == nil {
			*err = fmt.Errorf("%v", msg)
		} else {
			*err = fmt.Errorf("%v:\n%v", msg, assertionError.err)
		}
	} else if recovered != nil {
		*err = fmt.Errorf("%v:\nrecovered from panic: \n%v", msg, recovered)
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

func (h *Handler) DontRecover() {
	recoverEnabled = false
}

func NewHandler(e *error, msgs ...interface{}) *Handler {
	msg := objsToString(msgs)
	if Config.DebugPrint {
		println(msg)
	}
	return &Handler{err: e, messages: msgs}
}
