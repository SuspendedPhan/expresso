package ast

import (
	"syscall/js"
)

type ProtoAttribute struct {
	Id
	Name
	CustomPixiSetter func(pixi js.Value, value Float)
}
