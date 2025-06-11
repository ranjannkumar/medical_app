package middlewares

import (
	"fmt"
	"medical_app/config"
	"medical_app/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware authenticates requests using JWT
func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Expected format: Bearer <token>
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization header format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims, err := utils.ValidateJWT(tokenString, cfg)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("Invalid or expired token: %v", err)})
			c.Abort()
			return
		}

		// Store user info in context for downstream handlers
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// AuthorizeRoles returns a middleware that checks if the user has one of the allowed roles
func AuthorizeRoles(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role not found in context"})
			c.Abort()
			return
		}

		userRole, ok := role.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Invalid role type in context"})
			c.Abort()
			return
		}

		for _, allowedRole := range allowedRoles {
			if userRole == allowedRole {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Insufficient role permissions"})
		c.Abort()
	}
}

