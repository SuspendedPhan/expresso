package main

type Id struct {
	id string
}

func (i Id) getId() string {
	return i.id
}

func (i *Id) setId(id string) {
	i.id = id
}
