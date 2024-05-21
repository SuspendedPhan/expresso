package dehydrated

import (
	"expressioni.sta/ast"
	"expressioni.sta/common"
	"expressioni.sta/protos"
)

const (
	NodeTypeNumber                = "Number"
	NodeTypePrimitiveFunctionCall = "PrimitiveFunctionCall"
)

type Hydrator struct {
	functionById  map[string]*ast.Function
	attributeById map[string]*ast.Attribute
}

type NodeBase struct {
	Id       string
	NodeType string
}

type PrimitiveFunction struct {
	Id         string
	Name       string
	Parameters []*ast.PrimitiveFunctionParameter
}

type Organism struct {
	Id         string
	Name       string
	PlayerAttributes                   []Attribute
	IntrinsicAttributeByProtoAttributeId map[string]Attribute
	ProtoOrganismId				   string
}

type Attribute struct {
	RootNode interface{}
	Id       string
	Name     string
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

type Function struct {
	Id         string
	Name       string
	Parameters []string
}

type FunctionCallNode struct {
	NodeBase
	FunctionId string
	Children   []interface{}
}

type AttributeReferenceNode struct {
	NodeBase
	AttributeId string
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

func HydrateNode(node interface{}) ast.Node {
	switch node := node.(type) {
	case *NumberNode:
		return HydrateNumberNode(node)
	}
	return nil
}

func DehydrateNumberNode(node ast.NumberNode) *NumberNode {
	return &NumberNode{Value: node.Value, NodeBase: NodeBase{Id: node.GetId(), NodeType: NodeTypeNumber}}
}

func HydrateNumberNode(node *NumberNode) *ast.NumberNode {
	return &ast.NumberNode{Value: node.Value, NodeBase: ast.NodeBase{Id: common.Id{Id: node.Id}}}
}

func DehydratePrimitiveFunctionCallNode(node ast.PrimitiveFunctionCallNode) *PrimitiveFunctionCallNode {
	children := node.GetChildren()
	dehydratedChildren := make([]interface{}, len(children))
	for i, child := range children {
		dehydratedChildren[i] = DehydrateNode(child)
	}
	return &PrimitiveFunctionCallNode{FunctionId: node.GetFunction().GetId(), Children: dehydratedChildren, NodeBase: NodeBase{Id: node.GetId(), NodeType: NodeTypePrimitiveFunctionCall}}
}

func (*Hydrator) HydratePrimitiveFunctionCallNode(node *PrimitiveFunctionCallNode) *ast.PrimitiveFunctionCallNode {
	children := make([]ast.Node, len(node.Children))
	for i, child := range node.Children {
		children[i] = HydrateNode(child)
	}
	fun := ast.GetPrimitiveFunctions()[node.FunctionId]
	n := ast.NewPrimitiveFunctionCallNode(fun)
	for i, child := range children {
		n.SetArgumentByIndex(i, child)
	}
	return n
}

func DehydrateFunction(function *ast.Function) *Function {
	parameters := function.GetParameters()
	parameterNames := make([]string, len(parameters))
	for i, parameter := range parameters {
		parameterNames[i] = parameter.GetName()
	}
	return &Function{Id: function.GetId(), Name: function.GetName(), Parameters: parameterNames}
}

func HydrateFunction(function *Function) *ast.Function {
	fun := ast.NewFunction(function.Name)
	for _, parameter := range function.Parameters {
		fun.AddParameter(parameter)
	}
	return fun
}

func DehydrateFunctionCallNode(node ast.FunctionCallNode) *FunctionCallNode {
	children := node.GetChildren()
	dehydratedChildren := make([]interface{}, len(children))
	for i, child := range children {
		dehydratedChildren[i] = DehydrateNode(child)
	}
	return &FunctionCallNode{FunctionId: node.GetFunction().GetId(), Children: dehydratedChildren, NodeBase: NodeBase{Id: node.GetId(), NodeType: NodeTypePrimitiveFunctionCall}}
}

func (h *Hydrator) HydrateFunctionCallNode(node *FunctionCallNode) *ast.FunctionCallNode {
	children := make([]ast.Node, len(node.Children))
	for i, child := range node.Children {
		children[i] = HydrateNode(child)
	}
	fun := h.functionById[node.FunctionId]
	n := ast.NewFunctionCallNode(fun)
	for i, child := range children {
		n.SetArgumentByIndex(i, child)
	}
	return n
}

func DehydrateAttributeReferenceNode(node ast.AttributeReferenceNode) *AttributeReferenceNode {
	return &AttributeReferenceNode{AttributeId: node.GetAttribute().GetId(), NodeBase: NodeBase{Id: node.GetId()}}
}

func (h *Hydrator) HydrateAttributeReferenceNode(node *AttributeReferenceNode) *ast.AttributeReferenceNode {
	return ast.NewAttributeReferenceNode(h.attributeById[node.AttributeId])
}

func DehydrateOrganism(organism ast.Organism) *Organism {
	playerAttributes := organism.PlayerAttributes
	dehydratedPlayerAttributes := make([]Attribute, len(playerAttributes))
	for i, attribute := range playerAttributes {
		dehydratedPlayerAttributes[i] = *DehydrateAttribute(*attribute)
	}
	intrinsicAttributeByProtoAttribute := organism.IntrinsicAttributeByProtoAttribute
	dehydratedIntrinsicAttributeByProtoAttribute := make(map[string]Attribute, len(intrinsicAttributeByProtoAttribute))
	for protoAttribute, attribute := range intrinsicAttributeByProtoAttribute {
		dehydratedIntrinsicAttributeByProtoAttribute[protoAttribute.GetId()] = *DehydrateAttribute(*attribute)
	}
	return &Organism{
		Id: organism.GetId(),
		Name: organism.GetName(),
		PlayerAttributes: dehydratedPlayerAttributes,
		IntrinsicAttributeByProtoAttributeId: dehydratedIntrinsicAttributeByProtoAttribute,
	}
}

func (h *Hydrator) HydrateOrganism(organism *Organism) *ast.Organism {
	playerAttributes := make([]*ast.Attribute, len(organism.PlayerAttributes))
	for i, attribute := range organism.PlayerAttributes {
		playerAttributes[i] = h.attributeById[attribute.Id]
	}
	intrinsicAttributeByProtoAttribute := make(map[*protos.ProtoAttribute]*ast.Attribute, len(organism.IntrinsicAttributeByProtoAttributeId))
	for protoAttributeId, attribute := range organism.IntrinsicAttributeByProtoAttributeId {
		// intrinsicAttributeByProtoAttribute[h.protoAttributeById[protoAttributeId]] = h.attributeById[attribute.Id]
	}
	org:= ast.NewOrganism()
	org.SetId(organism.Id)
	org.SetName(organism.Name)
	org.PlayerAttributes = playerAttributes
	org.IntrinsicAttributeByProtoAttribute = intrinsicAttributeByProtoAttribute
	return org

	// return ast.NewOrganism(organism.Name, playerAttributes, intrinsicAttributeByProtoAttribute)
}
