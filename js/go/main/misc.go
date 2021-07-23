package main

type Name struct {
	name string
}

func (n Name) getName() string {
	return n.name
}

func (n *Name) setName(name string) {
	n.name = name
}

func assert(condition bool) {
	if !condition {
		panic("assertion failed")
	}
}
