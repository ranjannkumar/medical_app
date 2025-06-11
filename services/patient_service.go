package services

import (
	"errors"
	"log"
	"medical_app/models"
	"gorm.io/gorm"
)

// PatientServiceImpl provides patient management related services
type PatientServiceImpl struct {
	DB *gorm.DB
}

func NewPatientService(db *gorm.DB) *PatientServiceImpl {
	return &PatientServiceImpl{DB: db}
}

// creates a new patient record
func (s *PatientServiceImpl) CreatePatient(patient *models.Patient) error {
	if err := s.DB.Create(patient).Error; err != nil {
		log.Printf("Error creating patient in DB: %v", err)
		return err
	}
	return nil
}

//  retrieves all patient records
func (s *PatientServiceImpl) GetAllPatients() ([]models.Patient, error) {
	var patients []models.Patient
	if err := s.DB.Find(&patients).Error; err != nil {
		log.Printf("Error retrieving all patients from DB: %v", err)
		return nil, err
	}
	return patients, nil
}

// retrieves a single patient record by ID
func (s *PatientServiceImpl) GetPatientByID(id uint) (*models.Patient, error) {
	var patient models.Patient
	if err := s.DB.First(&patient, id).Error; err != nil {
		return nil, err
	}
	return &patient, nil
}

// it updates an existing patient record
func (s *PatientServiceImpl) UpdatePatient(patient *models.Patient) error {
	if err := s.DB.Save(patient).Error; err != nil {
		log.Printf("Error updating patient in DB: %v", err)
		return err
	}
	return nil
}

//  deletes a patient record by ID
func (s *PatientServiceImpl) DeletePatient(id uint) error {
	if err := s.DB.Delete(&models.Patient{}, id).Error; err != nil {
		log.Printf("Error deleting patient from DB: %v", err)
		return err
	}
	return nil
}

//  updates only the doctor_notes field for a patient
func (s *PatientServiceImpl) UpdatePatientDoctorNotes(id uint, doctorNotes, status string) error {
	result := s.DB.Model(&models.Patient{}).Where("id = ?", id).Updates(map[string]interface{}{
		"doctor_notes": doctorNotes,
		"status":       status,
	})
	if result.Error != nil {
		log.Printf("Error updating doctor notes for patient ID %d: %v", id, result.Error)
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("patient not found")
	}
	return nil
}