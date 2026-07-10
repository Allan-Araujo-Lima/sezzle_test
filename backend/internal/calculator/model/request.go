package model

// Request is the payload for a calculation.
type Request struct {
	Operation Operation `json:"operation" example:"add"`
	Operand1  float64   `json:"operand1" example:"2"`
	Operand2  float64   `json:"operand2" example:"3"`
}
