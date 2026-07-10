package service

import (
	"math"

	"backend/sezzle_test/internal/calculator/model"
)

type CalculatorService struct{}

func NewCalculatorService() *CalculatorService {
	return &CalculatorService{}
}

func (s *CalculatorService) Calculate(operation model.Operation, operand1, operand2 float64) (float64, error) {
	switch operation {
	case model.Add:
		return operand1 + operand2, nil
	case model.Subtract:
		return operand1 - operand2, nil
	case model.Multiply:
		return operand1 * operand2, nil
	case model.Divide:
		if operand2 == 0 {
			return 0, ErrDivisionByZero
		}
		return operand1 / operand2, nil
	case model.Exponent:
		return math.Pow(operand1, operand2), nil
	case model.SquareRoot:
		if operand1 < 0 {
			return 0, ErrNegativeRoot
		}
		return math.Sqrt(operand1), nil
	case model.Percent:
		return (operand1 / 100) * operand2, nil
	default:
		return 0, ErrInvalidOperation
	}
}
