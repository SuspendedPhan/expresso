package main

import "syscall/js"

// ElementLayout is a proxy to ElementLayout.ts. Use NewElementLayout() to create an instance.
type ElementLayout struct {
	elementLayout js.Value
}

// NewElementLayout instantiates an instance of the provided TypeScript ElementLayout class and returns an
// ElementLayout which is a proxy to the instance. For the rest of the parameters after the ElementLayout class, NewElementLayout passes
// the parameters to the class constructor.
func NewElementLayout(elementLayoutClass js.Value, getRootNodeFunc js.Value, getChildrenFunc js.Value, getKeyFunc js.Value) ElementLayout {
	elementLayout := elementLayoutClass.New(getRootNodeFunc, getChildrenFunc, getKeyFunc)
	return ElementLayout{elementLayout: elementLayout}
}

func (e *ElementLayout) registerElement(element js.Value, elementKey string) {
	e.elementLayout.Call("registerElement", element, elementKey)
}

func (e ElementLayout) getLocalPositionObservable(elementKey string) js.Value {
	return e.elementLayout.Call("getLocalPositionObservable")
}

func (e ElementLayout) getOnCalculated() js.Value {
	return e.elementLayout.Get("onCalculated")
}
