package main

import (
	"github.com/gin-gonic/gin"

	"github.com/allan-araujo-lima/sezzle_test/backend/internal/calculator/routes"
)

func main() {

	router := gin.Default()

	routes.RegisterRoutes(router)

	router.Run(":8080")
}
