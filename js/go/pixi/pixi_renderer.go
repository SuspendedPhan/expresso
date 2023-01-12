package pixi

import "syscall/js"

const makeCircleMethod = "makeCircle"
const destroyCircleMethod = "destroyCircle"

// TODO: rename to manager
type Manager struct {
	object js.Value
}

func (p Manager) MakeCircle() js.Value {
	return p.object.Call(makeCircleMethod)
}

func (p Manager) DestroyCircle(circle js.Value) {
	p.object.Call(destroyCircleMethod, circle)
}
