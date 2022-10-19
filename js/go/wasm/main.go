package wasm

import (
	"expressioni.sta/ast"
	"math"
	"reflect"
)

type abser struct {
	number float32
}

func (a abser) ab() float32 {
	return float32(math.Abs(float64(a.number)))
}

func main() {
	c := make(chan struct{}, 0)
	println("start go main")

	bootstrapGoModule()

	println("end go main")
	<-c
	return

	ast.SetupPrimitiveFunctions()
	//
	//function := Function{}
	//function.setName("Lerp")
	//a := parameterExpr(function.addParameter("a"))
	//b := parameterExpr(function.addParameter("b"))
	//t := parameterExpr(function.addParameter("t"))
	//
	//rootNode := a.add(t.mul(b.sub(a))).getNode()
	//function.setRootNode(rootNode)
	//
	//functionCall := functionExpr(function).args([]Expr{number(50), number(100), number(.5)}).getNode()
	//attribute := Attribute{}
	//attribute.setRootNode(functionCall)
	//println(attribute.eval())

}

func register(reflectType reflect.Type) {

}
