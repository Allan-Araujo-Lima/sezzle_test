import { useCalculator } from "../hooks/useCalculator";
import { Display } from "./Display";
import { Keypad } from "./Keypad";

export function Calculator() {
    const calculator = useCalculator()

    return (
        <section className="calculator">
            <Display value={calculator.state.displayValue} error={calculator.error} isLoading={calculator.isLoading} />
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
