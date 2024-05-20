package common

import "github.com/google/uuid"

type Id struct {
	Id string
}

func (i Id) GetId() string {
	return i.Id
}

func (i *Id) SetId(id string) {
	i.Id = id
}

func GenerateId() Id {
	return Id{Id: uuid.New().String()}
}
