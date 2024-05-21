package main

import (
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
}

func register(reflectType reflect.Type) {

}
