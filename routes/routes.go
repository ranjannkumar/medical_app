package routes

import (
	"medical_app/config"
	"medical_app/controllers"
	"medical_app/middlewares"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all application routes
func SetupRoutes(router *gin.Engine, authCtrl *controllers.AuthController, patientCtrl *controllers.PatientController, cfg *config.Config) {

	// API Routes
	api := router.Group("/api")
	{
		api.POST("/login", authCtrl.Login)
		api.POST("/register", authCtrl.RegisterUser) 
	}

	// Authenticated routes
	authenticated := api.Group("/")
	authenticated.Use(middlewares.AuthMiddleware(cfg))
	{
		// Patient routes (common for receptionist and doctor to view)
		authenticated.GET("/patients", patientCtrl.GetAllPatients)
		authenticated.GET("/patients/:id", patientCtrl.GetPatientByID)

		// Receptionist specific routes
		receptionist := authenticated.Group("/receptionist")
		receptionist.Use(middlewares.AuthorizeRoles("receptionist"))
		{
			receptionist.POST("/patients", patientCtrl.CreatePatient)
			receptionist.PUT("/patients/:id", patientCtrl.UpdatePatient) // Receptionist can update most patient details
			receptionist.DELETE("/patients/:id", patientCtrl.DeletePatient)
		}

		// Doctor specific routes
		doctor := authenticated.Group("/doctor")
		doctor.Use(middlewares.AuthorizeRoles("doctor"))
		{
			// Doctor can only update doctor_notes and status
			doctor.PUT("/patients/:id/notes", patientCtrl.UpdatePatientDoctorNotes)
			// Doctors can also view all patients and specific patients (already covered by authenticated group)
		}
	}
}

