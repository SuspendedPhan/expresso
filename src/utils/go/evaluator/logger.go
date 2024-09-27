package evaluator

type Logger2 interface {
	Log(args ...interface{})
	Error(args ...interface{})
}
