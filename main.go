package main

import (
	"log"
	"medical_app/config"
	"medical_app/db"
	"medical_app/models"
)

func main() {
	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Initialize Database
	database.InitDB(cfg)

	// 3. Run Migrations
	err := database.DB.AutoMigrate(&models.User{}, &models.Patient{})
	if err != nil {
		log.Fatalf("Failed to auto migrate database: %v", err)
	}
	log.Println("Database migrations completed successfully")

}











