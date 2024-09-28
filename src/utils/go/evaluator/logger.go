// File: logger.go

package evaluator

import "fmt"

const minLevel = 8

type Logger2 interface {
	Log3(level int, args ...interface{})

	Log(args ...interface{})
	Error(args ...interface{})
}

type NoopLogger struct{}

func (l *NoopLogger) Log(args ...interface{})   {}
func (l *NoopLogger) Error(args ...interface{}) {}

func (l *NoopLogger) Log3(level int, args ...interface{}) {
	if level >= minLevel {
		fmt.Println(args...)
	}
}
