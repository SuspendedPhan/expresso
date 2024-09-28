package evaluator

type Logger2 interface {
	Log(args ...interface{})
	Error(args ...interface{})
}

type NoopLogger struct{}

func (l *NoopLogger) Log(args ...interface{})   {}
func (l *NoopLogger) Error(args ...interface{}) {}
