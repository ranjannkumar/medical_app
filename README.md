**Medical Portal Application🏥🏥**

This is a simple Go web application, built with Gin and GORM (PostgreSQL), to manage patients. It includes separate portals for receptionists and doctors.

**Features👇👇**

User Login: Single sign-on for both receptionists and doctors using JWT authentication.

Role-Based Access: Different permissions for receptionists and doctors.

Receptionist Functions: Register new patients and perform full CRUD (Create, Read, Update, Delete) operations on patient records.

Doctor Functions: View patient details and update doctor_notes and status.

Data Storage: Uses PostgreSQL for all user and patient data.

**Technology Stack👇👇**

Backend: Go (Gin Gonic, GORM, JWT, Bcrypt)

Database: PostgreSQL

Frontend: React with Vite (using Fetch API and Tailwind CSS)

**Setup and Running the Application👇👇**

**Prerequisites**

Go (1.18+)

PostgreSQL database

**Steps**

Get the Code:

git clone <repository_url>

cd medical_app

Install Go Dependencies:

go mod tidy

Set up Database:

Create a PostgreSQL database (e.g., medical_db).

Ensure you have a user with access.

**Configure .env:**

Create a .env file in the medical_app/ root.

DATABASE_URL="host=localhost user=your_user password=your_password dbname=medical_db port=5432 sslmode=disable TimeZone=Asia/Kolkata"

JWT_SECRET="your_very_strong_jwt_secret_key"

PORT="8080"

Update placeholders with your actual DB details.

Run Backend:

go run main.go

This starts the API server (default: http://localhost:8080).

(Initial run will create receptionist/password and doctor/password users.)

**API Endpoints (for Postman)👇👇**

All API endpoints start with /api. Authenticated requests need an Authorization header: Bearer <your_jwt_token>.

**Authentication**

POST /api/login: Authenticate with username/password, get JWT.

POST /api/register: Create new user (receptionist or doctor).

**Patient Management (Receptionist Role)**

POST /api/receptionist/patients: Add new patient.

GET /api/patients: Get all patients (also for Doctor).

GET /api/patients/:id: Get patient by ID (also for Doctor).

PUT /api/receptionist/patients/:id: Update patient details.

DELETE /api/receptionist/patients/:id: Delete patient.

**Patient Management (Doctor Role)**

PUT /api/doctor/patients/:id/notes: Update doctor_notes and status.

**Frontend Usage👇👇**

Start Go Backend: Follow the steps above.

Run Frontend:

npm run dev

Open Browser: Go to http://localhost:8080/.

Login: Use receptionist/password or doctor/password.

Explore: Interact with the portals to manage patients.

**Unit Tests👇**

I've included unit tests for the user_service and patient_service using an in-memory SQLite database.

To run tests:

go test ./tests/...

**My Additions👇**

User Roles: Implemented explicit receptionist and doctor roles with JWT and middleware.

Patient Status: Added a Status field (active, discharged, on_leave).

Doctor Notes: Dedicated text field for doctors' specific notes.

Bootstrap Users: Automatic creation of default users on first run.

Search: Client-side patient search for easy filtering.

Modals: Used confirmation and edit modals for better UX.

Error Handling: Basic error feedback for API calls.

CORS: Enabled CORS for smooth frontend interaction.
