package controllers

import (
	"log"
	"medical_app/models"
	"medical_app/services"
	"net/http"
	"strconv"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PatientController handles patient-related requests
type PatientController struct {
	PatientService *services.PatientServiceImpl
}

// NewPatientController creates a new PatientController instance
func NewPatientController(patientSvc *services.PatientServiceImpl) *PatientController {
	return &PatientController{
		PatientService: patientSvc,
	}
}

// CreatePatientRequest defines the request body for creating a patient
type CreatePatientRequest struct {
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	DOB       string `json:"dob"`
	Gender    string `json:"gender"`
	Contact   string `json:"contact" binding:"required"`
	Address   string `json:"address"`
}

// CreatePatient handles creating a new patient (Receptionist role)
func (ctrl *PatientController) CreatePatient(c *gin.Context) {
	var req CreatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	patient := &models.Patient{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		DOB:       req.DOB,
		Gender:    req.Gender,
		Contact:   req.Contact,
		Address:   req.Address,
		Status:    "active", // Default status
	}

	if err := ctrl.PatientService.CreatePatient(patient); err != nil {
		// Check for unique constraint violation (e.g., contact)
		if err.Error() == "UNIQUE constraint failed: patients.contact" { // This error message might vary based on DB driver/GORM version
			c.JSON(http.StatusConflict, gin.H{"error": "Patient with this contact already exists"})
			return
		}
		log.Printf("Failed to create patient: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create patient"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Patient created successfully", "patient": patient})
}

// GetAllPatients handles retrieving all patient records (Receptionist & Doctor roles)
func (ctrl *PatientController) GetAllPatients(c *gin.Context) {
	patients, err := ctrl.PatientService.GetAllPatients()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve patients"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"patients": patients})
}

// GetPatientByID handles retrieving a single patient record by ID (Receptionist & Doctor roles)
func (ctrl *PatientController) GetPatientByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	patient, err := ctrl.PatientService.GetPatientByID(uint(id))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
			return
		}
		log.Printf("Failed to get patient by ID %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve patient"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"patient": patient})
}

// UpdatePatientRequest defines the request body for updating a patient
type UpdatePatientRequest struct {
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	DOB         string `json:"dob"`
	Gender      string `json:"gender"`
	Contact     string `json:"contact"`
	Address     string `json:"address"`
	DoctorNotes string `json:"doctor_notes"`
	Status      string `json:"status"`
}

// UpdatePatient handles updating a patient record (Receptionist role for most fields, Doctor for notes/status)
func (ctrl *PatientController) UpdatePatient(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	var req UpdatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	patient, err := ctrl.PatientService.GetPatientByID(uint(id))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
			return
		}
		log.Printf("Failed to get patient for update by ID %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve patient for update"})
		return
	}

	// Update fields selectively based on role if necessary, or just update all for now
	// For simplicity, receptionist can update all fields except doctor_notes and status
	// Doctor can update all and doctor_notes/status
	// This can be refined with more granular ACLs if needed.

	// General patient info update (receptionist)
	if req.FirstName != "" {
		patient.FirstName = req.FirstName
	}
	if req.LastName != "" {
		patient.LastName = req.LastName
	}
	if req.DOB != "" {
		patient.DOB = req.DOB
	}
	if req.Gender != "" {
		patient.Gender = req.Gender
	}
	if req.Contact != "" {
		patient.Contact = req.Contact
	}
	if req.Address != "" {
		patient.Address = req.Address
	}

	// Doctor-specific updates (can also be done by receptionist in this simplified version if they have full update access)
	if req.DoctorNotes != "" {
		patient.DoctorNotes = req.DoctorNotes
	}
	if req.Status != "" {
		patient.Status = req.Status
	}


	if err := ctrl.PatientService.UpdatePatient(patient); err != nil {
		log.Printf("Failed to update patient ID %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Patient updated successfully", "patient": patient})
}


// UpdatePatientDoctorNotes handles updating only doctor_notes and status (Doctor role)
func (ctrl *PatientController) UpdatePatientDoctorNotes(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	var req struct {
		DoctorNotes string `json:"doctor_notes"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.DoctorNotes == "" && req.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Either doctor_notes or status is required"})
		return
	}

	err = ctrl.PatientService.UpdatePatientDoctorNotes(uint(id), req.DoctorNotes, req.Status)
	if err != nil {
		if err.Error() == "patient not found" { // Custom error message from service
			c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
			return
		}
		log.Printf("Failed to update doctor notes for patient ID %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update doctor notes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Doctor notes and status updated successfully"})
}


// DeletePatient handles deleting a patient record (Receptionist role)
func (ctrl *PatientController) DeletePatient(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	if err := ctrl.PatientService.DeletePatient(uint(id)); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
			return
		}
		log.Printf("Failed to delete patient ID %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete patient"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Patient deleted successfully"})
}

