package services

import (
	"errors"
	"log"
	"medical_app/models"
	"medical_app/utils"
	"gorm.io/gorm"
)

type AuthServiceImpl struct {
	DB *gorm.DB
}

// creates a new AuthService instance
func NewAuthService(db *gorm.DB) *AuthServiceImpl {
	return &AuthServiceImpl{DB: db}
}

// Login authenticates a user
func (s *AuthServiceImpl) Login(username, password string) (*models.User, error) {
	var user models.User
	if err := s.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid credentials")
		}
		log.Printf("Error finding user by username: %v", err)
		return nil, err
	}

	if !utils.CheckPasswordHash(password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	return &user, nil
}