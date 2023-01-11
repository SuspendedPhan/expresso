package main

import "syscall/js"

// pixiPool is used to make shapes appear on the screen. It's an object pool where each object is an object in the PIXI
// scene graph, which are rendered on the canvas. Call newPixiPool to create an instance.
type pixiPool struct {
	pool            js.Value
	usedPixiObjects []js.Value
}

func newPixiPool(pool js.Value) *pixiPool {
	return &pixiPool{pool: pool, usedPixiObjects: make([]js.Value, 0)}
}

// use acquires an object from the pixi pool and makes it visible.
func (c *pixiPool) use() js.Value {
	pixiObject := c.pool.Call("use")
	pixiObject.Set("visible", true)
	c.usedPixiObjects = append(c.usedPixiObjects, pixiObject)
	return pixiObject
}

// recycleAll releases all the objects that have been acquired and makes them invisible.
func (c *pixiPool) recycleAll() {
	for _, pixiObject := range c.usedPixiObjects {
		pixiObject.Set("visible", false)
		c.pool.Call("recycle", pixiObject)
	}
	c.usedPixiObjects = make([]js.Value, 0)
}
