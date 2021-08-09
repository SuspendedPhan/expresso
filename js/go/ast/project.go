package ast

type Project struct {
	name string
}

func (p Project) GetOrganismById(id string) *Organism {
	panic("not imp")
}

func (p Project) dehydrate() interface{} {
	return nil
	//dehydratedProject := GetDehydratedStruct(p)
	//return reflect.New(dehydratedProject).Interface()
}
