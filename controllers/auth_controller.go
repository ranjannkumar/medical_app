package controllers

import (
	"log"
	"medical_app/config"
	"medical_app/models"
	"medical_app/services"
	"medical_app/utils"
	"net/http"
	"github.com/gin-gonic/gin"
)

// AuthController handles authentication requests
type AuthController struct {
	AuthService *services.AuthServiceImpl
	UserService *services.UserServiceImpl
	Config      *config.Config
}

// NewAuthController creates a new AuthController instance
func NewAuthController(authSvc *services.AuthServiceImpl, userSvc *services.UserServiceImpl, cfg *config.Config) *AuthController {
	return &AuthController{
		AuthService: authSvc,
		UserService: userSvc,
		Config:      cfg,
	}
}

// LoginRequest defines the request body for login
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Login handles user login
func (ctrl *AuthController) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ctrl.AuthService.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	token, err := utils.GenerateJWT(user.Username, user.Role, ctrl.Config)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
		"user": gin.H{
			"username": user.Username,
			"role":     user.Role,
		},
	})
}

// RegisterUserRequest defines the request body for user registration
type RegisterUserRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"` // "receptionist" or "doctor"
}

// RegisterUser handles new user registration
func (ctrl *AuthController) RegisterUser(c *gin.Context) {
	var req RegisterUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Basic validation for role
	if req.Role != "receptionist" && req.Role != "doctor" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role. Must be 'receptionist' or 'doctor'"})
		return
	}

	// Check if user already exists
	_, err := ctrl.UserService.GetUserByUsername(req.Username)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	user := &models.User{
		Username: req.Username,
		Password: req.Password, // Password will be hashed in service layer
		Role:     req.Role,
	}

	if err := ctrl.UserService.CreateUser(user); err != nil {
		log.Printf("Failed to register user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully", "username": user.Username, "role": user.Role})
}
