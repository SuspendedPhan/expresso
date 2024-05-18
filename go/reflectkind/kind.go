package reflectkind

import (
	"expressioni.sta/common"
	"reflect"
)

type Struct struct {
	reflect.Value
}

func ValueToStruct(value reflect.Value) (_ Struct, err error) {
	hnd := common.NewHandler(&err, "ValueToStruct")
	defer hnd.Handle()

	hnd.Assert(value.Kind() == reflect.Struct)
	return Struct{Value: value}, nil
}
