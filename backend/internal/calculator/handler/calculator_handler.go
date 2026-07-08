package handler

import "github.com/allan-araujo-lima/sezzle_test/backend/internal/calculator/service"

type CalculatorHandler struct {
	calculatorService *service.CalculatorService
}

func NewCalculatorHandler(calculatorService *service.CalculatorService) *CalculatorHandler {
	return &CalculatorHandler{
		calculatorService: calculatorService,
	}
}
