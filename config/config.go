package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds the application configuration
type Config struct {
	DatabaseURL string
	Port        string
}

// LoadConfig loads configuration from environment variables or .env file
func LoadConfig() *Config {
	// Load .env file if it exists (for local development)
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on environment variables.")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not set
	}

	return &Config{
		DatabaseURL: dbURL,
		Port:        port,
	}
}

