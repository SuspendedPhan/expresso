package common

type Name struct {
	Name string
}

func (n Name) GetName() string {
	return n.Name
}

func (n *Name) SetName(name string) {
	n.Name = name
}

func Assert(condition bool) {
	if !condition {
		panic("assertion failed")
	}
}
