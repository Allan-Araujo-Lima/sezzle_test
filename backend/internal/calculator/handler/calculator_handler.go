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

// Calculate godoc
//
//	@Summary		Calculate the result of an operation
//	@Description	Receives two operands and an operation and returns the result. Unary operations (squareRoot) use only operand1.
//	@Tags			calculator
//	@Accept			json
//	@Produce		json
//	@Param			request	body		model.Request	true	"Operation and operands"
//	@Success		200		{object}	model.Response
//	@Failure		400		{object}	model.ErrorResponse
//	@Router			/calculate [post]
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

	c.JSON(http.StatusOK, model.Response{
		Result: result,
	})
}
