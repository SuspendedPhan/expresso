package dehydrated

// import (
// 	"github.com/stretchr/testify/assert"
// 	"gopkg.in/yaml.v3"
// 	"os"
// 	"strings"
// 	"testing"
// )

type UnmarshNode struct {
	nodeType string
}

type UnmarshAttr struct {
	name     string
	rootNode UnmarshNode
}

// func TestSimple(t *testing.T) {
// 	attribute := Attribute{
// 		RootNode: NewNumberNode(10),
// 		Name:     "x",
// 		Id:       "x",
// 	}

// 	marsh := Marsh(attribute)

// 	file, err := os.ReadFile("./simple.yaml")
// 	if err != nil {
// 		panic(err)
// 	}
// 	os.Remove("./simple-log.yaml")
// 	err = os.WriteFile("./simple-log.yaml", []byte(marsh), 777)
// 	if err != nil {
// 		panic(err)
// 	}
// 	assert.Equal(t, string(file), marsh)
// }

// func TestUnmarsh(t *testing.T) {
// 	expectedAttr := Attribute{
// 		RootNode: NewNumberNode(10),
// 		Name:     "x",
// 		Id:       "x",
// 	}
// 	file, err := os.ReadFile("./simple.yaml")
// 	if err != nil {
// 		panic(err)
// 	}
// 	attr := Unmarsh(file)
// 	assert.Equal(t, attr.Id, expectedAttr.Id)
// 	assert.Equal(t, attr.Name, expectedAttr.Name)
// 	assert.Equal(t, attr.RootNode.(*NumberNode).NodeType, expectedAttr.RootNode.(*NumberNode).NodeType)
// 	assert.Equal(t, attr.RootNode.(*NumberNode).Value, expectedAttr.RootNode.(*NumberNode).Value)
// }

// func Marsh(attribute Attribute) string {
// 	builder := strings.Builder{}
// 	encoder := yaml.NewEncoder(&builder)
// 	encoder.SetIndent(2)
// 	err := encoder.Encode(&attribute)
// 	if err != nil {
// 		panic(err)
// 	}
// 	return builder.String()
// }

// func Unmarsh(file []byte) *Attribute {
// 	attr := Attribute{}
// 	err := yaml.Unmarshal(file, &attr)
// 	if err != nil {
// 		panic(err)
// 	}
// 	return &attr
// }
