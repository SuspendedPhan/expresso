package main

import (
	"expressionista/common"
)

func main() {
	common.Config.DebugPrint = true
	common.Config.Save()
}
