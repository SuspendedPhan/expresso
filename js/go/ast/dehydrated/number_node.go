package dehydrated

import "expressionista/ast"

type NumberNode struct {
	NodeType string
	Value    ast.Float
}

func NewNumberNode(value ast.Float) *NumberNode {
	return &NumberNode{Value: value, NodeType: "Number"}
}
