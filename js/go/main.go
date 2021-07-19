package main

func main() {
	println("hello go")
	setupPrimitiveFunctions()

	function := Function{}
	function.setName("Lerp")
	a := parameterExpr(function.addParameter("a"))
	b := parameterExpr(function.addParameter("b"))
	t := parameterExpr(function.addParameter("t"))

	rootNode := a.add(t.mul(b.sub(a))).getNode()
	function.setRootNode(rootNode)

	functionCall := functionExpr(function).args([]Expr{number(50), number(100), number(.5)}).getNode()
	attribute := Attribute{}
	attribute.setRootNode(functionCall)
	println(attribute.eval())
}
