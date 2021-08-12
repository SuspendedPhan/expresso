package common

import (
	"fmt"
	"strings"
)

type Name struct {
	Name string
}

func (n Name) GetName() string {
	return n.Name
}

func (n *Name) SetName(name string) {
	n.Name = name
}

func Assert(condition bool, objs ...interface{}) {
	if !condition {
		if len(objs) == 0 {
			panic(assertionError{})
		} else {
			panic(assertionError{err: fmt.Errorf(objsToString(objs))})
		}
	}
}

func AssertNilErr(err error) {
	if err != nil {
		panic(assertionError{err: err})
	}
}

func AddErrorInfo(err *error, objs ...interface{}) func() {
	msg := objsToString(objs)

	if Config.DebugPrint {
		println(msg)
	}
	return func() {
		if *err != nil {
			*err = fmt.Errorf("%v: %v", msg, *err)
		}

		r := recover()

		// i didn't handle the case where we have an error AND a panic
		// i don't think it should be possible
		Assert(r == nil || *err == nil)

		if r != nil {
			assertionError, ok := r.(assertionError)
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

func objsToString(objs []interface{}) string {
	msgs := make([]string, 0)
	for _, obj := range objs {
		msgs = append(msgs, fmt.Sprintf("%v", obj))
	}
	msg := strings.Join(msgs, " ")
	return msg
}
