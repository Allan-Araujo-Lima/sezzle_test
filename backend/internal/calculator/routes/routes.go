package routes

import (
	"github.com/gin-gonic/gin"

	"backend/sezzle_test/internal/calculator/handler"
	"backend/sezzle_test/internal/calculator/service"
)

func RegisterRoutes(router *gin.Engine) {
	calculatorService := service.NewCalculatorService()
	calculatorHandler := handler.NewCalculatorHandler(calculatorService)

	router.POST("/calculate", calculatorHandler.Calculate)
}
