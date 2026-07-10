package model

// Response is the result of a successful calculation.
type Response struct {
	Result float64 `json:"result" example:"5"`
}

// ErrorResponse is returned when a request fails.
type ErrorResponse struct {
	Error string `json:"error" example:"invalid operation"`
}
