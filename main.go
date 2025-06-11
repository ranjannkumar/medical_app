package main

import (
	"log"
	"medical_app/config"
	"medical_app/controllers"
	"medical_app/db"
	"medical_app/models"
	"medical_app/routes"
	"medical_app/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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

	// Default Users (for initial setup)
	bootstrapUsers(database.DB)

	// services
	authService := services.NewAuthService(database.DB)
	userService := services.NewUserService(database.DB)
	patientService := services.NewPatientService(database.DB)

	// Controllers
	authController := controllers.NewAuthController(authService, userService, cfg)
	patientController := controllers.NewPatientController(patientService)

	// Setup Gin Router
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	routes.SetupRoutes(router, authController, patientController, cfg)

	// Start Server
	log.Printf("Server starting on :%s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}

}

// bootstrapUsers creates default users if they don't exist
func bootstrapUsers(db *gorm.DB) {
	userService := services.NewUserService(db)

	// Create a default receptionist
	receptionistUser := &models.User{
		Username: "receptionist",
		Password: "password", // Will be hashed by service
		Role:     "receptionist",
	}
	_, err := userService.GetUserByUsername(receptionistUser.Username)
	if err != nil { // User not found, create it
		if err := userService.CreateUser(receptionistUser); err != nil {
			log.Printf("Failed to bootstrap receptionist user: %v", err)
		} else {
			log.Println("Bootstrapped default receptionist user: receptionist/password")
		}
	} else {
		log.Println("Receptionist user already exists.")
	}

	// Create a default doctor
	doctorUser := &models.User{
		Username: "doctor",
		Password: "password", // Will be hashed by service
		Role:     "doctor",
	}
	_, err = userService.GetUserByUsername(doctorUser.Username)
	if err != nil { // User not found, create it
		if err := userService.CreateUser(doctorUser); err != nil {
			log.Printf("Failed to bootstrap doctor user: %v", err)
		} else {
			log.Println("Bootstrapped default doctor user: doctor/password")
		}
	} else {
		log.Println("Doctor user already exists.")
	}
}










