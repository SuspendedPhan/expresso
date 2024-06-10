package evaluator

import "syscall/js"

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
		message += arg.(string)
	}
	js.Global().Get("Logger").Call("topic", l.topic).Call("log", message)
}
