package ast

type Id struct {
	Id string
}

func (i Id) GetId() string {
	return i.Id
}

func (i *Id) setId(id string) {
	i.Id = id
}
