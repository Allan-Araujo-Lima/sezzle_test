package service

import (
	"errors"
	"testing"

	"backend/sezzle_test/internal/calculator/model"
)

func TestCalculate(t *testing.T) {
	s := NewCalculatorService()

	tests := []struct {
		name      string
		operation model.Operation
		operand1  float64
		operand2  float64
		want      float64
		wantErr   error
	}{
		{name: "add", operation: model.Add, operand1: 2, operand2: 3, want: 5},
		{name: "add negatives", operation: model.Add, operand1: -2, operand2: -3, want: -5},
		{name: "subtract", operation: model.Subtract, operand1: 10, operand2: 4, want: 6},
		{name: "subtract into negative", operation: model.Subtract, operand1: 4, operand2: 10, want: -6},
		{name: "multiply", operation: model.Multiply, operand1: 6, operand2: 7, want: 42},
		{name: "multiply by zero", operation: model.Multiply, operand1: 6, operand2: 0, want: 0},
		{name: "divide", operation: model.Divide, operand1: 10, operand2: 4, want: 2.5},
		{name: "divide by zero", operation: model.Divide, operand1: 10, operand2: 0, wantErr: ErrDivisionByZero},
		{name: "exponent", operation: model.Exponent, operand1: 2, operand2: 3, want: 8},
		{name: "square", operation: model.Square, operand1: 5, operand2: 0, want: 25},
		{name: "percent", operation: model.Percent, operand1: 50, operand2: 200, want: 100},
		{name: "invalid operation", operation: model.Operation("no_operator"), operand1: 2, operand2: 3, wantErr: ErrInvalidOperation},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := s.Calculate(tt.operation, tt.operand1, tt.operand2)

			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("Calculate() error = %v, wantErr %v", err, tt.wantErr)
			}
			if tt.wantErr == nil && got != tt.want {
				t.Errorf("Calculate() = %v, want %v", got, tt.want)
			}
		})
	}
}
