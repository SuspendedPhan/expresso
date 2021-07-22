package main

type Id struct {
	Id string
}

func (i Id) getId() string {
	return i.Id
}

func (i *Id) setId(id string) {
	i.Id = id
}
