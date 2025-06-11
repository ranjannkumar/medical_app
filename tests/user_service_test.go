package tests

import (
	"log"
	"medical_app/models"
	"medical_app/services"
	"medical_app/utils"
	"os"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var testDB *gorm.DB

func TestMain(m *testing.M) {
	// Setup: Initialize in-memory SQLite for testing
	var err error
	testDB, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to test database: %v", err)
	}

	// AutoMigrate the models for testing
	err = testDB.AutoMigrate(&models.User{}, &models.Patient{})
	if err != nil {
		log.Fatalf("failed to auto migrate models: %v", err)
	}

	// Run tests
	code := m.Run()

	// Teardown (not strictly necessary for in-memory, but good practice)
	sqlDB, _ := testDB.DB()
	sqlDB.Close()

	os.Exit(code)
}

// TestUserService_CreateUser tests the CreateUser method of UserServiceImpl
func TestUserService_CreateUser(t *testing.T) {
	userService := services.NewUserService(testDB)

	user := &models.User{
		Username: "testuser",
		Password: "password123",
		Role:     "receptionist",
	}

	err := userService.CreateUser(user)
	if err != nil {
		t.Fatalf("CreateUser failed: %v", err)
	}

	// Verify user exists and password is hashed
	var fetchedUser models.User
	if err := testDB.Where("username = ?", "testuser").First(&fetchedUser).Error; err != nil {
		t.Fatalf("Failed to fetch created user: %v", err)
	}

	if fetchedUser.Username != user.Username {
		t.Errorf("Expected username %s, got %s", user.Username, fetchedUser.Username)
	}
	if !utils.CheckPasswordHash("password123", fetchedUser.Password) {
		t.Errorf("Password hashing/checking failed")
	}
}

// TestUserService_GetUserByUsername tests the GetUserByUsername method
func TestUserService_GetUserByUsername(t *testing.T) {
	userService := services.NewUserService(testDB)

	// Ensure a user exists for fetching
	hashedPass, _ := utils.HashPassword("anotherpass")
	testDB.Create(&models.User{Username: "anotheruser", Password: hashedPass, Role: "doctor"})

	user, err := userService.GetUserByUsername("anotheruser")
	if err != nil {
		t.Fatalf("GetUserByUsername failed: %v", err)
	}

	if user.Username != "anotheruser" || user.Role != "doctor" {
		t.Errorf("Fetched user details mismatch. Expected anotheruser/doctor, got %s/%s", user.Username, user.Role)
	}

	// Test non-existent user
	_, err = userService.GetUserByUsername("nonexistent")
	if err == nil {
		t.Errorf("Expected error for non-existent user, got none")
	}
}  