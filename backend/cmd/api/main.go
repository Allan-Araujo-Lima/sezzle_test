package main

import (
	"github.com/gin-gonic/gin"

	"backend/sezzle_test/internal/calculator/routes"
	"backend/sezzle_test/internal/middleware"
)

func main() {

	router := gin.Default()
	router.Use(middleware.CORSMiddleware())

	routes.RegisterRoutes(router)

	router.Run(":8080")
}
