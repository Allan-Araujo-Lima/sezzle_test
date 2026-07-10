import { act, renderHook } from '@testing-library/react'
import type { CalcRequest } from '../../../interfaces/calculator'
import { useCalculator } from './useCalculator'

// Mirror of the mocked backend arithmetic, same as useCalculator.test.ts.
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

function press(key: string, target: EventTarget = window) {
    act(() => {
        target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    })
}

describe('useCalculator - keyboard', () => {
    it('types digits from the keyboard', () => {
        const { result } = renderHook(() => useCalculator())
        press('4')
        press('2')
        expect(result.current.state.displayValue).toBe('42')
    })

    it('inputs a decimal with "." and ","', () => {
        const { result } = renderHook(() => useCalculator())
        press('1')
        press('.')
        press('5')
        expect(result.current.state.displayValue).toBe('1.5')

        act(() => result.current.clear())
        press('2')
        press(',')
        press('5')
        expect(result.current.state.displayValue).toBe('2.5')
    })

    it('deletes the last digit with Backspace', () => {
        const { result } = renderHook(() => useCalculator())
        press('9')
        press('9')
        press('Backspace')
        expect(result.current.state.displayValue).toBe('9')
    })

    it.each(['Escape', 'Delete'])('clears with %s', (key) => {
        const { result } = renderHook(() => useCalculator())
        press('7')
        press(key)
        expect(result.current.state.displayValue).toBe('0')
    })

    it.each([
        ['+', 'add' as const, 3],
        ['-', 'subtract' as const, -1],
        ['*', 'multiply' as const, 2],
        ['x', 'multiply' as const, 2],
        ['X', 'multiply' as const, 2],
        ['/', 'divide' as const, 0.5],
        ['^', 'exponent' as const, 1],
    ])('maps "%s" to the %s operation', async (key, operation, expected) => {
        const { result } = renderHook(() => useCalculator())
        press('1')
        press(key)
        press('2')
        await act(async () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        })

        expect(mockedApi).toHaveBeenCalledWith(
            { operand1: 1, operand2: 2, operation },
            expect.anything(),
        )
        expect(result.current.state.displayValue).toBe(String(expected))
    })

    it('calculates with "=" as well as Enter', async () => {
        const { result } = renderHook(() => useCalculator())
        press('2')
        press('+')
        press('3')
        await act(async () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '=', bubbles: true }))
        })
        expect(result.current.state.displayValue).toBe('5')
    })

    it('applies percent with "%"', async () => {
        const { result } = renderHook(() => useCalculator())
        press('5')
        press('0')
        await act(async () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '%', bubbles: true }))
        })
        expect(mockedApi).toHaveBeenCalledWith(
            { operand1: 50, operand2: 100, operation: 'divide' },
            expect.anything(),
        )
        expect(result.current.state.displayValue).toBe('0.5')
    })

    it('ignores unmapped keys', () => {
        const { result } = renderHook(() => useCalculator())
        press('5')
        press('a')
        press('Tab')
        expect(result.current.state.displayValue).toBe('5')
    })

    it('ignores keystrokes while typing in an input field', () => {
        const { result } = renderHook(() => useCalculator())
        const input = document.createElement('input')
        document.body.appendChild(input)

        press('7', input)

        expect(result.current.state.displayValue).toBe('0')
        document.body.removeChild(input)
    })

    it('detaches the keyboard listener on unmount', () => {
        const { result, unmount } = renderHook(() => useCalculator())
        unmount()
        press('8')
        expect(result.current.state.displayValue).toBe('0')
    })
})

describe('useCalculator - error handling', () => {
    it('shows a generic message when the rejection is not an Error', async () => {
        mockedApi.mockRejectedValueOnce('boom')
        const { result } = renderHook(() => useCalculator())
        press('1')
        press('+')
        press('1')
        await act(async () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        })

        expect(result.current.error).toBe('An unknown error occurred.')
        expect(result.current.isLoading).toBe(false)
    })
})
