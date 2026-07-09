package service

import "backend/sezzle_test/internal/calculator/model"

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
		return pow(operand1, operand2), nil
	case model.Square:
		return operand1 * operand1, nil
	case model.Percent:
		return (operand1 / 100) * operand2, nil
	default:
		return 0, ErrInvalidOperation
	}
}

func pow(operand1, operand2 float64) float64 {
	result := 1.0
	for i := 0; i < int(operand2); i++ {
		result *= operand1
	}
	return result
}
