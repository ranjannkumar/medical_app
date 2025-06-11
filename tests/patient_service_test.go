package tests

import (
	"medical_app/models"
	"medical_app/services"
	"testing"
)

//  TestPatientService_CRUD tests patient CRUD operations
func TestPatientService_CRUD(t *testing.T) {
	patientService := services.NewPatientService(testDB)

	// --- Create Patient ---
	patient := &models.Patient{
		FirstName: "John",
		LastName:  "Doe",
		Contact:   "1234567890",
		Status:    "active",
	}
	err := patientService.CreatePatient(patient)
	if err != nil {
		t.Fatalf("CreatePatient failed: %v", err)
	}
	if patient.ID == 0 {
		t.Errorf("Expected patient ID to be set, got 0")
	}

	// --- Get Patient by ID ---
	fetchedPatient, err := patientService.GetPatientByID(patient.ID)
	if err != nil {
		t.Fatalf("GetPatientByID failed: %v", err)
	}
	if fetchedPatient.FirstName != "John" || fetchedPatient.Contact != "1234567890" {
		t.Errorf("Fetched patient details mismatch")
	}

	// --- Get All Patients ---
	patients, err := patientService.GetAllPatients()
	if err != nil {
		t.Fatalf("GetAllPatients failed: %v", err)
	}
	if len(patients) == 0 {
		t.Errorf("Expected more than 0 patients, got %d", len(patients))
	}

	// --- Update Patient ---
	fetchedPatient.LastName = "Smith"
	fetchedPatient.Status = "discharged"
	err = patientService.UpdatePatient(fetchedPatient)
	if err != nil {
		t.Fatalf("UpdatePatient failed: %v", err)
	}
	updatedPatient, _ := patientService.GetPatientByID(patient.ID)
	if updatedPatient.LastName != "Smith" || updatedPatient.Status != "discharged" {
		t.Errorf("Patient update failed. Expected Smith/discharged, got %s/%s", updatedPatient.LastName, updatedPatient.Status)
	}

	// --- Update Patient Doctor Notes ---
	err = patientService.UpdatePatientDoctorNotes(patient.ID, "Patient is recovering well.", "active")
	if err != nil {
		t.Fatalf("UpdatePatientDoctorNotes failed: %v", err)
	}
	updatedPatientNotes, _ := patientService.GetPatientByID(patient.ID)
	if updatedPatientNotes.DoctorNotes != "Patient is recovering well." || updatedPatientNotes.Status != "active" {
		t.Errorf("Doctor notes update failed. Expected 'Patient is recovering well.'/active, got '%s'/%s", updatedPatientNotes.DoctorNotes, updatedPatientNotes.Status)
	}


	// --- Delete Patient ---
	err = patientService.DeletePatient(patient.ID)
	if err != nil {
		t.Fatalf("DeletePatient failed: %v", err)
	}
	_, err = patientService.GetPatientByID(patient.ID)
	if err == nil {
		t.Errorf("Expected patient to be deleted, but it was found")
	}
}