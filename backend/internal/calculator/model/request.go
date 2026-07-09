package model

type Request struct {
	Operation Operation `json:"operation"`
	Operand1  float64   `json:"operand1"`
	Operand2  float64   `json:"operand2"`
}
