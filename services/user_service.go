package services

import (
	"log"
	"medical_app/models"
	"medical_app/utils"
	"gorm.io/gorm"
)
type UserServiceImpl struct {
	DB *gorm.DB
}

func NewUserService(db *gorm.DB) *UserServiceImpl {
	return &UserServiceImpl{DB: db}
}

// creates a new user
func (s *UserServiceImpl) CreateUser(user *models.User) error {
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return err
	}
	user.Password = hashedPassword
	if err := s.DB.Create(user).Error; err != nil {
		log.Printf("Error creating user in DB: %v", err)
		return err
	}
	return nil
}

// it retrieves a user by username
func (s *UserServiceImpl) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	if err := s.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}