export interface Calculator {
    state: CalculatorState;
    setState: (state: CalculatorState) => void;
    calculate: () => void;
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

export interface CalculatorState {
    operand1: number;
    operand2: number;
    operation: Operator;
    result: number | null;
}

export type Operator =
    | "add"
    | "subtract"
    | "multiply"
    | "divide"
    | "exponent"
    | "square"
    | "percent";
