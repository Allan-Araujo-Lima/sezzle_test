import { act, renderHook } from '@testing-library/react'
import type { CalcRequest } from '../../../interfaces/calculator'
import { useCalculator } from './useCalculator'

// The API layer is mocked so tests don't need a running backend. The fake
// mirrors the backend arithmetic, letting us assert both the request the hook
// sends and the resulting state.
vi.mock('../api/calculate', () => ({
    calculateApi: vi.fn(),
}))
import { calculateApi } from '../api/calculate'

function compute({ operand1, operand2, operation }: CalcRequest): number {
    switch (operation) {
        case 'add': return operand1 + operand2
        case 'subtract': return operand1 - operand2
        case 'multiply': return operand1 * operand2
        case 'divide': return operand1 / operand2
        case 'exponent': return Math.pow(operand1, operand2)
        case 'squareRoot': return Math.sqrt(operand1)
        case 'percent': return (operand1 * operand2) / 100
        default: return 0
    }
}

const mockedApi = vi.mocked(calculateApi)

beforeEach(() => {
    mockedApi.mockReset()
    mockedApi.mockImplementation(async (req) => ({ result: compute(req) }))
})

function setup() {
    return renderHook(() => useCalculator())
}

function type(result: ReturnType<typeof setup>['result'], digits: string) {
    act(() => {
        for (const d of digits) result.current.inputDigit(d)
    })
}

describe('useCalculator - input', () => {
    it('starts at 0', () => {
        const { result } = setup()
        expect(result.current.state.displayValue).toBe('0')
    })

    it('builds a number from digits', () => {
        const { result } = setup()
        type(result, '123')
        expect(result.current.state.displayValue).toBe('123')
    })

    it('inputs a decimal', () => {
        const { result } = setup()
        type(result, '1')
        act(() => result.current.inputDecimal())
        type(result, '5')
        expect(result.current.state.displayValue).toBe('1.5')
    })

    it('toggles the sign', () => {
        const { result } = setup()
        type(result, '5')
        act(() => result.current.toggleSign())
        expect(result.current.state.displayValue).toBe('-5')
    })

    it('backspaces the last digit', () => {
        const { result } = setup()
        type(result, '123')
        act(() => result.current.backspace())
        expect(result.current.state.displayValue).toBe('12')
    })
})

describe('useCalculator - operations', () => {
    it('adds two operands and records history', async () => {
        const { result } = setup()
        type(result, '1')
        act(() => result.current.chooseOperation('add'))
        type(result, '1')
        await act(async () => { await result.current.calculate() })

        expect(result.current.state.displayValue).toBe('2')
        expect(result.current.history).toHaveLength(1)
        expect(result.current.history[0]).toMatchObject({
            operand1: 1, operand2: 1, operation: 'add', result: 2,
        })
    })

    it('raises to an exponent (2 ^ 6 = 64)', async () => {
        const { result } = setup()
        type(result, '2')
        act(() => result.current.chooseOperation('exponent'))
        type(result, '6')
        await act(async () => { await result.current.calculate() })

        expect(result.current.state.displayValue).toBe('64')
    })

    it('applies square root immediately (√9 = 3)', async () => {
        const { result } = setup()
        type(result, '9')
        await act(async () => { await result.current.applyUnary('squareRoot') })

        expect(mockedApi).toHaveBeenCalledWith(
            { operand1: 9, operand2: 0, operation: 'squareRoot' },
            expect.anything(),
        )
        expect(result.current.state.displayValue).toBe('3')
    })
})

describe('useCalculator - percent', () => {
    it('divides by 100 with no pending operation (50% = 0.5)', async () => {
        const { result } = setup()
        type(result, '50')
        await act(async () => { await result.current.applyPercent() })

        expect(mockedApi).toHaveBeenCalledWith(
            { operand1: 50, operand2: 100, operation: 'divide' },
            expect.anything(),
        )
        expect(result.current.state.displayValue).toBe('0.5')
    })

    it('takes percent of the first operand for + (100 + 5% = 105)', async () => {
        const { result } = setup()
        type(result, '100')
        act(() => result.current.chooseOperation('add'))
        type(result, '5')
        await act(async () => { await result.current.applyPercent() })

        expect(mockedApi).toHaveBeenCalledWith(
            { operand1: 100, operand2: 5, operation: 'add' },
            expect.anything(),
        )
        expect(result.current.state.displayValue).toBe('105')
    })

    it('uses the value as a fraction for × (100 × 5% = 5)', async () => {
        const { result } = setup()
        type(result, '100')
        act(() => result.current.chooseOperation('multiply'))
        type(result, '5')
        await act(async () => { await result.current.applyPercent() })

        expect(mockedApi).toHaveBeenCalledWith(
            { operand1: 100, operand2: 0.05, operation: 'multiply' },
            expect.anything(),
        )
        expect(result.current.state.displayValue).toBe('5')
    })

    it('uses the value as a fraction for ÷ (100 ÷ 5% = 2000)', async () => {
        const { result } = setup()
        type(result, '100')
        act(() => result.current.chooseOperation('divide'))
        type(result, '5')
        await act(async () => { await result.current.applyPercent() })

        expect(mockedApi).toHaveBeenCalledWith(
            { operand1: 100, operand2: 0.05, operation: 'divide' },
            expect.anything(),
        )
        expect(result.current.state.displayValue).toBe('2000')
    })
})

describe('useCalculator - history & reset', () => {
    it('recalls a history result into the display', () => {
        const { result } = setup()
        act(() => result.current.recallValue(42))
        expect(result.current.state.displayValue).toBe('42')
    })

    it('clears the history', async () => {
        const { result } = setup()
        type(result, '1')
        act(() => result.current.chooseOperation('add'))
        type(result, '1')
        await act(async () => { await result.current.calculate() })
        expect(result.current.history).toHaveLength(1)

        act(() => result.current.clearHistory())
        expect(result.current.history).toHaveLength(0)
    })

    it('clears all state', () => {
        const { result } = setup()
        type(result, '123')
        act(() => result.current.clear())
        expect(result.current.state.displayValue).toBe('0')
    })

    it('surfaces an API error and keeps the display', async () => {
        mockedApi.mockRejectedValueOnce(new Error('division by zero'))
        const { result } = setup()
        type(result, '1')
        act(() => result.current.chooseOperation('divide'))
        type(result, '0')
        await act(async () => { await result.current.calculate() })

        expect(result.current.error).toBe('division by zero')
        expect(result.current.isLoading).toBe(false)
        expect(result.current.history).toHaveLength(0)
    })
})
