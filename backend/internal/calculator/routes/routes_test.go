package routes

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestRegisterRoutes_CalculateEndpoint(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	RegisterRoutes(router)

	req := httptest.NewRequest(
		http.MethodPost,
		"/calculate",
		strings.NewReader(`{"operation":"add","operand1":2,"operand2":3}`),
	)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("POST /calculate status = %d, want %d (body: %s)", w.Code, http.StatusOK, w.Body.String())
	}
	if !strings.Contains(w.Body.String(), `"result":5`) {
		t.Errorf("body = %s, want it to contain result 5", w.Body.String())
	}
}

func TestRegisterRoutes_UnknownRouteReturns404(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	RegisterRoutes(router)

	req := httptest.NewRequest(http.MethodGet, "/does-not-exist", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}
