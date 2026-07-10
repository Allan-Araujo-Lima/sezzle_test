package main

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "backend/sezzle_test/docs"
	"backend/sezzle_test/internal/calculator/routes"
	"backend/sezzle_test/internal/middleware"
)

//	@title			Sezzle Calculator API
//	@version		1.0
//	@description	Calculation API for the Sezzle calculator.
//	@host			localhost:8080
//	@BasePath		/
//	@schemes		http

func main() {

	router := gin.Default()
	router.Use(middleware.CORSMiddleware())

	routes.RegisterRoutes(router)

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	router.Run(":8080")
}
