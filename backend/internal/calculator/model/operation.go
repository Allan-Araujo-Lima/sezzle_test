package model

type Operation string

const (
	Add      Operation = "add"
	Subtract Operation = "subtract"
	Multiply Operation = "multiply"
	Divide   Operation = "divide"
	Exponent Operation = "exponent"
	Square   Operation = "square"
	Percent  Operation = "percent"
)
