package models
import "gorm.io/gorm"
// Patient represents a patient in the system
type Patient struct {
	gorm.Model
	FirstName   string `gorm:"not null"`
	LastName    string `gorm:"not null"`
	DOB         string // Date of Birth (e.g., "YYYY-MM-DD")
	Gender      string
	Contact     string `gorm:"unique"` // Phone number or email
	Address     string
	DoctorNotes string `gorm:"type:text"` // For doctors to update
	Status      string `gorm:"default:'active'"` // e.g., "active", "discharged"
}