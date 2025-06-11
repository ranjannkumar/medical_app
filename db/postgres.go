package database

import (
	"log"
	"medical_app/config" 
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB global database connection
var DB *gorm.DB

// InitDB initializes the database connection
func InitDB(cfg *config.Config) {
	var err error
	DB, err = gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connection established successfully")
}

