package main

import (
	"expressioni.sta/common"
)

func main() {
	common.Config.DebugPrint = false
	common.Config.Save()
}
