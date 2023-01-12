package main

import (
	"expressioni.sta/pixi"
	"syscall/js"
)

// pixiPool is used to make shapes appear on the screen. It's an object pool where each object is an object in the PIXI
// scene graph, which are rendered on the canvas. Call newPixiPool to create an instance.
type pixiPool struct {
	manager         pixi.Manager
	usedPixiObjects []js.Value
}

func newPixiPool(manager pixi.Manager) *pixiPool {
	return &pixiPool{manager: manager, usedPixiObjects: make([]js.Value, 0)}
}

// use acquires an object from the pixi pool and makes it visible.
func (c *pixiPool) use() js.Value {
	pixiObject := c.manager.MakeCircle()
	pixiObject.Set("visible", true)
	c.usedPixiObjects = append(c.usedPixiObjects, pixiObject)
	return pixiObject
}

// recycleAll releases all the objects that have been acquired and makes them invisible.
func (c *pixiPool) recycleAll() {
	for _, pixiObject := range c.usedPixiObjects {
		pixiObject.Set("visible", false)
		c.manager.DestroyCircle(pixiObject)
	}
	c.usedPixiObjects = make([]js.Value, 0)
}
