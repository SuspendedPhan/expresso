# Go Version
go version go1.17 windows/amd64

# Note on js.Func
Whenever we have a js.Func, we should recover panics and print the errors manually instead of letting the go
runtime do it. If we don't recover a panic, the go runtime makes a blocking fmt.Print call, which causes the
main routine to hang before the stacktrace is actually printed. Preventing the hang makes debugging more convenient.

# Known memory leaks
- Every js.FuncOf needs a call to Release()
- Untested memory cleanup in node_component.go
- Are we cleaning up the map expressorContext.organismIdToOrganism upon removing root organisms and child organisms?
- In node_component.go, we subscribe to ElementLayout local position, but we never unsubscribe
- In setup_organism.go, we subscribe to ElementLayout local position, but we never unsubscribe
- In TreeLayout.vue, we never detach() the ResizeSensor.. might be a leak..

# Things you need to install

1. `go get github.com/agnivade/wasmbrowsertest`
2. Go to $GOPATH/bin and rename the `wasmbrowsertest` binary to go_js_wasm_exec.