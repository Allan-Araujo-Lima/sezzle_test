package handler

import (
	"backend/sezzle_test/internal/calculator/service"
	"net/http"

	"backend/sezzle_test/internal/calculator/model"
	"github.com/gin-gonic/gin"
)

type CalculatorHandler struct {
	calculatorService *service.CalculatorService
}

func NewCalculatorHandler(calculatorService *service.CalculatorService) *CalculatorHandler {
	return &CalculatorHandler{
		calculatorService: calculatorService,
	}
}

func (h *CalculatorHandler) Calculate(c *gin.Context) {
	var request model.Request

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request payload",
		})
		return
	}

	result, err := h.calculatorService.Calculate(request.Operation, request.Operand1, request.Operand2)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"result": result,
	})
}
