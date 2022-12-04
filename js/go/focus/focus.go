package focus

import (
	"expressioni.sta/ast"
	"fmt"
)

// Focus manages focus for the app. E.g. nodes, attributes, and organism focus. It should be created using NewFocus().
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

// Register must be called before Focus can be called on a node. It returns signals for when the given node is focused
// or unfocused. Unregister must be called when the node is destroyed, otherwise there will be a memory leak.
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

// Focus triggers the unfocused signal for the currently focused node, and the focused signal for the given node.
// Register must be called for the node before Focus can be called.
func (f *Focus) Focus(node ast.Node) error {
	if node == f.focusedNode {
		return nil
	}
	if f.focusedNode != nil {
		unfocused, found := f.nodeToUnfocusedSignal[f.focusedNode]
		if !found {
			return fmt.Errorf("trying to unfocus, node with ID %s wasn't registered", f.focusedNode.GetId())
		}
		unfocused.Dispatch()
	}
	focused, found := f.nodeToFocusedSignal[node]
	if !found {
		return fmt.Errorf("trying to focus, node with ID %s wasn't registered", node.GetId())
	}
	focused.Dispatch()
	f.focusedNode = node
	return nil
}
