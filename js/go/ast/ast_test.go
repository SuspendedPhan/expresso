package ast

import (
	"encoding/json"
	"testing"
)

func TestName(t *testing.T) {
	m := map[string]int{
		"hi": 2,
	}
	marshal, _ := json.Marshal(&m)
	println(string(marshal))

}
