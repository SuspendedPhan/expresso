package focus

import (
	"expressioni.sta/ast"
)

// Focus manages focus for the app (e.g. nodes, attributes, organisms). For example, when a node is clicked,
// it captures focus. Focus should be created using NewFocus().
type Focus struct {
	nodeToFocusedSignal   map[ast.Node]*ast.Signal
	nodeToUnfocusedSignal map[ast.Node]*ast.Signal
	focusedNode           ast.Node
}

func NewFocus() *Focus {
	return &Focus{
		nodeToFocusedSignal:   make(map[ast.Node]*ast.Signal),
		nodeToUnfocusedSignal: make(map[ast.Node]*ast.Signal),
		focusedNode:           nil,
	}
}

// Register returns signals for when the given node is focused or unfocused. The signals won't fire for any past
// focus events. Unregister must be called when the node is destroyed, otherwise there will be a memory leak.
func (f Focus) Register(n ast.Node) (focused ast.ReadonlySignal, unfocused ast.ReadonlySignal) {
	_, found := f.nodeToFocusedSignal[n]
	if !found {
		f.nodeToFocusedSignal[n] = ast.NewSignal()
	}
	_, found = f.nodeToUnfocusedSignal[n]
	if !found {
		f.nodeToUnfocusedSignal[n] = ast.NewSignal()
	}
	return f.nodeToFocusedSignal[n], f.nodeToUnfocusedSignal[n]
}

// Unregister frees the memory related to the given registered node. It is the responsibility of the caller to invoke
// the off functions for the ReadonlySignals returned by Register.
func (f Focus) Unregister(n ast.Node) {
	delete(f.nodeToFocusedSignal, n)
	delete(f.nodeToUnfocusedSignal, n)
}

// SetFocusedNode triggers the unfocused signal for the currently focused node. Then, it triggers the focused signal
// for the given node. The node doesn't need to be registered.
func (f *Focus) SetFocusedNode(node ast.Node) {
	if node == f.focusedNode {
		return
	}
	if f.focusedNode != nil {
		unfocused, found := f.nodeToUnfocusedSignal[f.focusedNode]
		if found {
			unfocused.Dispatch()
		}
	}
	focused, found := f.nodeToFocusedSignal[node]
	if found {
		focused.Dispatch()
	}
	f.focusedNode = node
}

// FocusedNode returns the currently focused node.
func (f Focus) FocusedNode() ast.Node {
	return f.focusedNode
}
