package main

import (
	"syscall/js"
)

type ProtoAttribute struct {
	Id
	Name
	customPixiSetter func(pixi js.Value, value float)
}
