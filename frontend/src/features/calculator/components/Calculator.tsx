import type { Operator } from "../../../interfaces/calculator";
import { useCalculator } from "../hooks/useCalculator";
import { Display } from "./Display";
import { Keypad } from "./Keypad";

const OPERATOR_SYMBOLS: Record<Operator, string> = {
    add: '+',
    subtract: '−',
    multiply: '×',
    divide: '÷',
    percent: '%',
    exponent: '^',
    square: '²',
};

export function Calculator() {
    const calculator = useCalculator()
    const { state } = calculator

    const expression = state.activeOperand === 'operand2'
        ? `${state.operand1} ${OPERATOR_SYMBOLS[state.operation]}`
        : ''

    return (
        <section className="calculator">
            <Display
                value={calculator.state.displayValue}
                expression={expression}
                error={calculator.error}
                isLoading={calculator.isLoading}
            />
            <Keypad
                inputDigit={calculator.inputDigit}
                inputDecimal={calculator.inputDecimal}
                chooseOperation={calculator.chooseOperation}
                calculate={calculator.calculate}
                clear={calculator.clear}
                backspace={calculator.backspace}
                toggleSign={calculator.toggleSign}
                isLoading={calculator.isLoading}
            />
        </section>
    )
}
