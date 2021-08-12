package common

import (
	"gopkg.in/yaml.v3"
	"os"
)

type ConfigStruct struct {
	DebugPrint bool
}

var Config = load()

func getConfigPath() string {
	//abs, err := filepath.Abs(path.Join("..", "work", "config.yml"))
	//abs, err := filepath.Abs(path.Join("work", "config.yml"))
	//AssertNil(err)
	abs := `C:\Users\Dylan\Documents\GitHub\expresso\js\go\work\config.yml`
	return abs
}

func load() ConfigStruct {
	filePath := getConfigPath()
	file, err := os.ReadFile(filePath)
	println(filePath)
	AssertNil(err)
	config := ConfigStruct{}
	err = yaml.Unmarshal(file, &config)
	AssertNil(err)
	return config
}

func (config ConfigStruct) Save() {
	marshal, err := yaml.Marshal(config)
	AssertNil(err)
	err = os.WriteFile(getConfigPath(), marshal, os.FileMode(0777))
	AssertNil(err)
}
