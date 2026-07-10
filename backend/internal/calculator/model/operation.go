package model

type Operation string

const (
	Add        Operation = "add"
	Subtract   Operation = "subtract"
	Multiply   Operation = "multiply"
	Divide     Operation = "divide"
	Exponent   Operation = "exponent"
	SquareRoot Operation = "squareRoot"
	Percent    Operation = "percent"
)
