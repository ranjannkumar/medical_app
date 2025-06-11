package models

import "gorm.io/gorm"

// User represents a user in the system (receptionist or doctor)
type User struct {
	gorm.Model
	Username string `gorm:"unique;not null"`
	Password string `gorm:"not null"`
	Role     string `gorm:"not null"` // "receptionist" or "doctor"
}