package dehydrated

import (
	"gopkg.in/yaml.v3"
)

type Attribute struct {
	RootNode interface{}
	Name     string
	Id       string
}

func (a *Attribute) UnmarshalYAML(value *yaml.Node) error {
	type TempType Attribute
	attr := TempType{}
	err := value.Decode(&attr)
	if err != nil {
		panic(err)
	}
	//m := attr.RootNode.(map[string]interface{})
	for _, n := range value.Content {
		println(n.Value)
		println(n.Kind)
	}

	*a = Attribute(attr)
	return nil
}
