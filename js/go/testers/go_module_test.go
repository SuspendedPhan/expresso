package testers

import (
	"fmt"
	"reflect"
	"testing"
)

type testfrog struct {
}

func TestName(t *testing.T) {
	num := 10
	value := reflect.ValueOf(&num)
	fmt.Println(value.Type())
}
