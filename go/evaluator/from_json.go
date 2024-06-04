package evaluator

import "encoding/json"

type EvaluatorJson struct {
	Value float64
}

func FromJson(s string) *Evaluator {
	var evaluatorJson EvaluatorJson
	json.Unmarshal([]byte(s), &evaluatorJson)
	return &Evaluator{evaluatorJson.Value}
}
