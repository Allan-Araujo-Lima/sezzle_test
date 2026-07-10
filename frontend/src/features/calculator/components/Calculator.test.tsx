import { fireEvent, render, waitFor } from '@testing-library/react'
import type { CalcRequest } from '../../../interfaces/calculator'
import { Calculator } from './Calculator'

vi.mock('../api/calculate', () => ({
    calculateApi: vi.fn(),
}))
import { calculateApi } from '../api/calculate'

beforeEach(() => {
    vi.mocked(calculateApi).mockReset()
    vi.mocked(calculateApi).mockImplementation(async ({ operand1, operand2, operation }: CalcRequest) => {
        const result = operation === 'add' ? operand1 + operand2 : 0
        return { result }
    })
})

describe('<Calculator />', () => {
    it('renders the keypad', () => {
        const { getByRole } = render(<Calculator />)
        expect(getByRole('button', { name: '7' })).toBeInTheDocument()
        expect(getByRole('button', { name: '=' })).toBeInTheDocument()
    })

    it('computes 1 + 1 and shows the result and history', async () => {
        const { getByRole, container } = render(<Calculator />)

        fireEvent.click(getByRole('button', { name: '1' }))
        fireEvent.click(getByRole('button', { name: '+' }))
        fireEvent.click(getByRole('button', { name: '1' }))
        fireEvent.click(getByRole('button', { name: '=' }))

        await waitFor(() => {
            expect(container.querySelector('.calculator-value')).toHaveTextContent('2')
        })

        const historyItem = container.querySelector('.calculator-history__item')
        expect(historyItem).not.toBeNull()
        expect(historyItem).toHaveTextContent('1 + 1')
        expect(historyItem).toHaveTextContent('= 2')
    })

    it('shows the pending operation in the expression line', () => {
        const { getByRole, container } = render(<Calculator />)

        fireEvent.click(getByRole('button', { name: '1' }))
        fireEvent.click(getByRole('button', { name: '+' }))

        expect(container.querySelector('.calculator-expression')).toHaveTextContent('1 +')
    })
})
