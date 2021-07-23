package testers

import (
	"encoding/json"
	"testing"
)

type testfrog struct {
}

func TestName(t *testing.T) {
	m := map[string]int{
		"hi": 2,
	}
	marshal, _ := json.Marshal(&m)
	println(string(marshal))

}
