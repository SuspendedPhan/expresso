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
	//AssertNilErr(err)
	abs := `C:\Users\Dylan\Documents\GitHub\expresso\js\go\work\config.yml`
	return abs
}

func load() ConfigStruct {
	filePath := getConfigPath()
	file, err := os.ReadFile(filePath)
	println(filePath)
	AssertNilErr(err)
	config := ConfigStruct{}
	err = yaml.Unmarshal(file, &config)
	AssertNilErr(err)
	return config
}

func (config ConfigStruct) Save() {
	marshal, err := yaml.Marshal(config)
	AssertNilErr(err)
	err = os.WriteFile(getConfigPath(), marshal, os.FileMode(0777))
	AssertNilErr(err)
}
