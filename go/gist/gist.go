package gist

import "encoding/json"

func Write(s string) error {
	gu := gistUpdate{
		Description: "Updated Gist",
		Files: map[string]gistFile{
			"main.go": {
				Content: s,
			},
		},
	}
	return updateGist(gu)
}

func Read() ([]byte, error) {
	gist, err := getGist()
	if err != nil {
		panic(err)
	}

	// convert json to map

	var g map[string]interface{}
	err = json.Unmarshal(gist, &g)
	if err != nil {
		panic(err)
	}

	// get the content of the file
	files := g["files"].(map[string]interface{})
	main := files["main.go"].(map[string]interface{})
	content := main["content"].(string)
	return []byte(content), nil
}
