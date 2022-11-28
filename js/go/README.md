# Known memory leaks
- Every js.FuncOf needs a call to Release()
- Untested memory cleanup in node_component.go

# Things you need to install

1. `go get github.com/agnivade/wasmbrowsertest`
2. Go to $GOPATH/bin and rename the `wasmbrowsertest` binary to go_js_wasm_exec.