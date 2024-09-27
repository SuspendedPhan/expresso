package main

import (
	"fmt"
	"syscall/js"
)

type Logger struct {
	topic string
}

func NewLogger(topic string) *Logger {
	return &Logger{topic: topic}
}

func (l *Logger) Log(args ...interface{}) {
	message := ""
	for i, arg := range args {
		if i > 0 {
			message += " "
		}
		message += fmt.Sprintf("%v", arg)
	}
	js.Global().Get("log3").Invoke(11, "["+l.topic+"]", message)

	// fmt.Println(l.topic, message)
}

func (l *Logger) Error(args ...interface{}) {
	message := ""
	for i, arg := range args {
		if i > 0 {
			message += " "
		}
		message += fmt.Sprintf("%v", arg)
	}
	js.Global().Get("error3").Invoke(10, "["+l.topic+"]", message)
}
