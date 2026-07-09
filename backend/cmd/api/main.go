package main

import (
	"github.com/gin-gonic/gin"

	"backend/sezzle_test/internal/calculator/routes"
)

func main() {

	router := gin.Default()

	routes.RegisterRoutes(router)

	router.Run(":8080")
}
