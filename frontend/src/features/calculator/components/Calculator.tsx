import { useCalculator } from "../hooks/useCalculator";
import { OPERATOR_SYMBOLS } from "../utils/operators";
import { Display } from "./Display";
import { History } from "./History";
import { Keypad } from "./Keypad";

export function Calculator() {
    const calculator = useCalculator()
    const { state } = calculator

    const activeOperation = state.activeOperand === 'operand2' ? state.operation : null

    const expression = activeOperation
        ? `${state.operand1} ${OPERATOR_SYMBOLS[activeOperation]}`
        : ''

    return (
        <div className="calculator-layout">
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
                    activeOperation={activeOperation}
                />
            </section>
            <History
                entries={calculator.history}
                onSelect={calculator.recallValue}
                onClear={calculator.clearHistory}
            />
        </div>
    )
}
