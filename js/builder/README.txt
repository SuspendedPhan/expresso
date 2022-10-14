docker run --publish 9000:9000 --mount type=bind,source=//c/Users/Dylan/Documents/Github/expresso,target=/expresso -it dylankphan11/builder

docker run --publish 9000:9000 --mount type=bind,source=//c/Users/Dylan/Documents/Github/expresso,target=/expresso -t dylankphan11/builder bash -c "cd /expresso/js; npm run serve"
docker run --publish 9000:9000 --mount type=bind,source=//c/Users/Dylan/Documents/Github/expresso,target=/expresso -t dylankphan11/builder bash -c "cd /expresso/js/go ; GOOS=js GOARCH=wasm /usr/local/go/bin/go test ./wasm -exec /usr/local/go/misc/wasm/go_js_wasm_exec"

docker run --publish 9000:9000 --mount type=bind,source=//c/Users/Dylan/Documents/Github/expresso,target=/expresso -t dylankphan11/builder bash -c "cd /expresso/js; npm run serve"

# Command for running wasm test:
# You have to be in the wasm dir to run the test, you can't be in the expression.ista module (i.e. "go" dir) and run a relative package.
docker run --publish 9000:9000 --mount type=bind,source=//c/Users/Dylan/Documents/Github/expresso,target=/expresso -t dylankphan11/builder bash -c "cd /expresso/js/go/wasm ; GOOS=js GOARCH=wasm /usr/local/go/bin/go test -exec /usr/local/go/misc/wasm/go_js_wasm_exec"
docker run --mount type=bind,source=//c/Users/Dylan/Documents/Github/expresso,target=/expresso -t dylankphan11/builder bash -c "cd /expresso/js/go/wasm ; GOOS=js GOARCH=wasm /usr/local/go/bin/go test -exec /usr/local/go/misc/wasm/go_js_wasm_exec"