package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"backend/sezzle_test/internal/calculator/service"

	"github.com/gin-gonic/gin"
)

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	h := NewCalculatorHandler(service.NewCalculatorService())
	r := gin.New()
	r.POST("/calculate", h.Calculate)
	return r
}

func TestCalculateHandler(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		wantStatus int
		wantResult float64
		wantError  string
	}{
		{
			name:       "add success",
			body:       `{"operation":"add","operand1":2,"operand2":3}`,
			wantStatus: http.StatusOK,
			wantResult: 5,
		},
		{
			name:       "divide success",
			body:       `{"operation":"divide","operand1":10,"operand2":4}`,
			wantStatus: http.StatusOK,
			wantResult: 2.5,
		},
		{
			name:       "division by zero",
			body:       `{"operation":"divide","operand1":10,"operand2":0}`,
			wantStatus: http.StatusBadRequest,
			wantError:  service.ErrDivisionByZero.Error(),
		},
		{
			name:       "invalid operation",
			body:       `{"operation":"power","operand1":2,"operand2":3}`,
			wantStatus: http.StatusBadRequest,
			wantError:  service.ErrInvalidOperation.Error(),
		},
		{
			name:       "malformed json",
			body:       `{"operation":"add","operand1":`,
			wantStatus: http.StatusBadRequest,
			wantError:  "Invalid request payload",
		},
	}

	router := setupRouter()

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/calculate", strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d (body: %s)", w.Code, tt.wantStatus, w.Body.String())
			}

			var resp map[string]interface{}
			if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
				t.Fatalf("failed to unmarshal response: %v", err)
			}

			if tt.wantError != "" {
				if resp["error"] != tt.wantError {
					t.Errorf("error = %v, want %v", resp["error"], tt.wantError)
				}
				return
			}

			if resp["result"] != tt.wantResult {
				t.Errorf("result = %v, want %v", resp["result"], tt.wantResult)
			}
		})
	}
}
