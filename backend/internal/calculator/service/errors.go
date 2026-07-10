package service

import "errors"

var (
	ErrDivisionByZero = errors.New("division by zero")
)

var (
	ErrNegativeRoot = errors.New("cannot take the square root of a negative number")
)

var (
	ErrInvalidOperation = errors.New("invalid operation")
)
