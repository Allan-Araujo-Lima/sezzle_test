export interface Calculator {
    state: CalculatorState;
    isLoading: boolean;
    error: string | null;
    inputDigit: (digit: string) => void;
    inputDecimal: () => void;
    chooseOperation: (operation: Operator) => void;
    toggleSign: () => void;
    backspace: () => void;
    calculate: () => Promise<void>;
    clear: () => void;
}

export interface CalcRequest {
    operand1: number;
    operand2: number;
    operation: Operator;
}

export interface CalcResponse {
    result: number;
}

export interface HistoryEntry {
    id: number;
    operand1: number;
    operand2: number;
    operation: Operator;
    result: number;
}

export interface CalculatorState {
    operand1: number;
    operand2: number;
    operation: Operator;
    result: number | null;
    displayValue: string;
    activeOperand: CalculatorOperand;
    shouldResetDisplay: boolean;
}

export type CalculatorOperand = "operand1" | "operand2";

export type Operator =
    | "add"
    | "subtract"
    | "multiply"
    | "divide"
    | "exponent"
    | "square"
    | "squareRoot"
    | "percent";
