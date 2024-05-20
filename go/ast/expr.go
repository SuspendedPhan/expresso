package ast

//
//type Expr struct {
//	node Node
//}
//
//func (e Expr) getNode() Node {
//	return e.node
//}
//
//func (a Expr) sub(b Expr) Expr {
//	return a.binaryExpr(b, "-")
//}
//
//func (a Expr) mul(b Expr) Expr {
//	return a.binaryExpr(b, "*")
//}
//
//func (a Expr) add(b Expr) Expr {
//	return a.binaryExpr(b, "+")
//}
//
//func (e Expr) binaryExpr(a Expr, primitiveFunctionName string) Expr {
//	function, found := primitiveFunctions[primitiveFunctionName]
//	assert(found)
//	parameters := function.parameters
//	node := PrimitiveFunctionCallNode{function: function, argumentByParameter: make(map[*PrimitiveFunctionParameter]Node)}
//	node.SetArgument(parameters[0], e.node)
//	node.SetArgument(parameters[1], a.node)
//	return Expr{&node}
//}
//
//func parameterExpr(parameter PrimitiveFunctionParameter) Expr {
//	return Expr{node: ParameterNode{parameter}}
//}
//
//type FunctionCallExpr struct {
//	node FunctionCallNode
//}
//
//func (f FunctionCallExpr) getNode() Node {
//	return f.node
//}
//
//func (f FunctionCallExpr) args(exprs []Expr) FunctionCallExpr {
//	assert(len(exprs) == len(f.node.function.parameters))
//	for i := 0; i < len(exprs); i++ {
//		f.node.SetArgumentByIndex(i, exprs[i].node)
//	}
//	return f
//}
//
//func functionExpr(function Function) FunctionCallExpr {
//	node := FunctionCallNode{function: function, argumentByParameter: make(map[*PrimitiveFunctionParameter]Node)}
//	return FunctionCallExpr{node}
//}
//
//func number(f float32) Expr {
//	return Expr{&NumberNode{
//		value: f,
//	}}
//}
