package main

import (
	"log"
	"medical_app/config"
	"medical_app/db"
	"medical_app/models"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load Configuration
	cfg := config.LoadConfig()

	//  Initialize Database
	database.InitDB(cfg)

	err := database.DB.AutoMigrate(&models.User{}, &models.Patient{})
	if err != nil {
		log.Fatalf("Failed to auto migrate database: %v", err)
	}
	log.Println("Database migrations completed successfully")

	
	// Setup Gin Router
	router := gin.Default()

	// Start Server
	log.Printf("Server starting on :%s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}

}











