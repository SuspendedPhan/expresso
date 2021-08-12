package common

import (
	"fmt"
	"strings"
)

type Name struct {
	Name string
}

type AssertionError struct {
	err error
}

func (n Name) GetName() string {
	return n.Name
}

func (n *Name) SetName(name string) {
	n.Name = name
}

func Assert(condition bool) {
	if !condition {
		panic(AssertionError{})
	}
}

func AssertNilErr(err error) {
	if err != nil {
		panic(AssertionError{err: err})
	}
}

func AddErrorInfo(err *error, objs ...interface{}) func() {
	msgs := make([]string, 0)
	for _, obj := range objs {
		msgs = append(msgs, fmt.Sprintf("%v", obj))
	}
	msg := strings.Join(msgs, " ")

	if Config.DebugPrint {
		println(msg)
	}
	return func() {
		if *err != nil {
			*err = fmt.Errorf("%v: %v", msg, *err)
		}

		r := recover()
		if r != nil {
			assertionError, ok := r.(AssertionError)
			if ok {
				if assertionError.err == nil {
					*err = fmt.Errorf("assertion failed: %v", msg)
				} else {
					*err = fmt.Errorf("%v: %v", msg, assertionError.err)
				}
			} else {
				println("We just recovered. This shouldn't happen.")
				panic(r)
			}
		}
	}
}
