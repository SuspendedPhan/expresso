package gist

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

const (
	apiUrl     = "https://api.github.com/gists/"
	gistID     = "4fecd1f04cf402778c0f777b7eac5dc3" // Replace with your Gist ID
	token      = ""                                 // Replace with your GitHub token
	apiVersion = "2022-11-28"
)

type gistFile struct {
	Content string `json:"content"`
}

type gistUpdate struct {
	Description string              `json:"description"`
	Files       map[string]gistFile `json:"files"`
}

func updateGist(gistUpdate gistUpdate) error {
	jsonData, err := json.Marshal(gistUpdate)
	if err != nil {
		return fmt.Errorf("error marshalling JSON: %v", err)
	}

	_, err = sendGistRequest(http.MethodPatch, gistID, token, jsonData)
	return err
}

func getGist() ([]byte, error) {
	return sendGistRequest(http.MethodGet, gistID, token, nil)
}

func sendGistRequest(method, gistID, token string, jsonData []byte) ([]byte, error) {
	var req *http.Request
	var err error

	if method == http.MethodPatch {
		req, err = http.NewRequest(method, apiUrl+gistID, bytes.NewBuffer(jsonData))
	} else {
		req, err = http.NewRequest(method, apiUrl+gistID, nil)
	}

	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("X-GitHub-Api-Version", apiVersion)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		body, err := io.ReadAll(resp.Body)
		if method == http.MethodGet {
			if err != nil {
				return nil, fmt.Errorf("error reading response body: %v", err)
			}
			fmt.Println("Gist retrieved successfully")
		} else {
			fmt.Println("Gist updated successfully")
		}
		return body, nil
	} else {
		action := "update"
		if method == http.MethodGet {
			action = "retrieve"
		}
		return nil, fmt.Errorf("failed to %s gist: %s", action, resp.Status)
	}
}
