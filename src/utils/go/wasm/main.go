package main

func main() {
	c := make(chan struct{}, 0)
	// println("go main")

	bootstrapGoModule()

	// println("end go main")
	<-c
}
