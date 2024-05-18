package common

type Id struct {
	Id string
}

func (i Id) GetId() string {
	return i.Id
}

func (i *Id) SetId(id string) {
	i.Id = id
}
