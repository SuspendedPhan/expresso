### Why is this there a go.mod file here?
The wasm output file needs to be an executable program, not just an object file. It needs to have a
main function (which needs to be in a package called "main", otherwise it's just a regular function).

I just realized we could have created this main package within the expressionista module and we wouldn't need to have this extra module.
But in the future if we need multiple main methods / packages, this is how we can do it.

Here's the tutorial on local Go modules: https://brokencode.io/how-to-use-local-go-modules-with-golang-with-examples/

### This is the error that started all of this:
Got this error in chrome console: Expected magic word 00 61 73 6d, found 21 3c 61 72 @+0 when loading .wasm file compiled from Go
https://github.com/golang/go/issues/35657

### Why does the package name differ from the directory?
Skipping this for now. I would like to make the package name match the directory in the future.