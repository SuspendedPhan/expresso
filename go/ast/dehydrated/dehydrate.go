package dehydrated

import (
	"expressioni.sta/ast"
)

const (
	NodeTypeNumber                = "Number"
	NodeTypePrimitiveFunctionCall = "PrimitiveFunctionCall"
)

type NodeBase struct {
	Id       string
	NodeType string
}

type Attribute struct {
	RootNode interface{}
	Name     string
	Id       string
}

type NumberNode struct {
	NodeBase
	Value ast.Float
}

type PrimitiveFunctionCallNode struct {
	NodeBase
	FunctionId string
	Children   []interface{}
}

func DehydrateAttribute(attr ast.Attribute) *Attribute {
	return &Attribute{
		RootNode: attr.RootNode,
		Name:     attr.GetName(),
		Id:       attr.GetId(),
	}
}

func DehydrateNode(node ast.Node) interface{} {
	switch node := node.(type) {
	case *ast.NumberNode:
		return DehydrateNumberNode(*node)
	case *ast.PrimitiveFunctionCallNode:
		return DehydratePrimitiveFunctionCallNode(*node)
	}
	return nil
}

func DehydrateNumberNode(node ast.NumberNode) *NumberNode {
	return &NumberNode{Value: node.Value, NodeBase: NodeBase{Id: node.GetId(), NodeType: NodeTypeNumber}}
}

func DehydratePrimitiveFunctionCallNode(node ast.PrimitiveFunctionCallNode) *PrimitiveFunctionCallNode {
	children := node.GetChildren()
	dehydratedChildren := make([]interface{}, len(children))
	for i, child := range children {
		dehydratedChildren[i] = DehydrateNode(child)
	}
	return &PrimitiveFunctionCallNode{FunctionId: node.GetFunction(), Children: dehydratedChildren, NodeBase: NodeBase{Id: node.GetId(), NodeType: NodeTypePrimitiveFunctionCall}}
}
