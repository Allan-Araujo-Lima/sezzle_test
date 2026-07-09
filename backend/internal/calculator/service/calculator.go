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
	default:
		return 0, ErrInvalidOperation
	}
}
