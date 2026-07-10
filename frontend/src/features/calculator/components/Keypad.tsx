import type { Operator } from '../../../interfaces/calculator'
import { Button } from './Button'

type KeypadProps = {
    inputDigit: (digit: string) => void
    inputDecimal: () => void
    chooseOperation: (operator: Operator) => void
    calculate: () => void
    clear: () => void
    backspace: () => void
    toggleSign: () => void
    isLoading: boolean
}

export function Keypad(props: KeypadProps) {
    return (
        <div className="calculator-keypad">
            <Button variant="action" onClick={props.clear}>C</Button>
            <Button variant="action" onClick={props.backspace}>⌫</Button>
            <Button variant="action" onClick={props.toggleSign}>±</Button>
            <Button variant="operation" onClick={() => props.chooseOperation('divide')}>÷</Button>

            <Button onClick={() => props.inputDigit('7')}>7</Button>
            <Button onClick={() => props.inputDigit('8')}>8</Button>
            <Button onClick={() => props.inputDigit('9')}>9</Button>
            <Button variant="operation" onClick={() => props.chooseOperation('multiply')}>×</Button>

            <Button onClick={() => props.inputDigit('4')}>4</Button>
            <Button onClick={() => props.inputDigit('5')}>5</Button>
            <Button onClick={() => props.inputDigit('6')}>6</Button>
            <Button variant="operation" onClick={() => props.chooseOperation('subtract')}>−</Button>

            <Button onClick={() => props.inputDigit('1')}>1</Button>
            <Button onClick={() => props.inputDigit('2')}>2</Button>
            <Button onClick={() => props.inputDigit('3')}>3</Button>
            <Button variant="operation" onClick={() => props.chooseOperation('add')}>+</Button>

            <Button onClick={() => props.inputDigit('0')}>0</Button>
            <Button onClick={props.inputDecimal}>.</Button>
            <Button variant="operation" onClick={() => props.chooseOperation('percent')}>%</Button>
            <Button variant="equals" disabled={props.isLoading} onClick={() => void props.calculate()}>=</Button>
        </div>
    )
}
