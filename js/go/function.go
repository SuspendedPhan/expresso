package main

type Function struct {
	Name
	rootNode   Node
	parameters []*Parameter
}

func (f *Function) addParameter(s string) Parameter {
	parameter := Parameter{}
	parameter.setName(s)
	f.parameters = append(f.parameters, &parameter)
	return parameter
}

func (f Function) setRootNode(node Node) {
	f.rootNode = node
}
