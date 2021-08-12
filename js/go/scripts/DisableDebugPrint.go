package main

import (
	"expressionista/common"
)

func main() {
	common.Config.DebugPrint = false
	common.Config.Save()
}
