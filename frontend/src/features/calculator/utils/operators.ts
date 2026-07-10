import type { Operator } from "../../../interfaces/calculator";

export const OPERATOR_SYMBOLS: Record<Operator, string> = {
    add: '+',
    subtract: '−',
    multiply: '×',
    divide: '÷',
    percent: '%',
    exponent: '^',
    square: '²',
    squareRoot: '√',
};

/** Operators that act on a single operand and are applied immediately. */
export const UNARY_OPERATORS: ReadonlySet<Operator> = new Set<Operator>(['square', 'squareRoot']);
