import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CalcRequest } from '../../../interfaces/calculator'
import { calculateApi } from './calculate'
import { post } from '../../../lib/http'

vi.mock('../../../lib/http', () => ({
    post: vi.fn(),
}))

afterEach(() => {
    vi.clearAllMocks()
})

describe('calculateApi', () => {
    it('POSTs to /calculate with the request body and returns the response', async () => {
        const req: CalcRequest = { operation: 'add', operand1: 2, operand2: 3 }
        vi.mocked(post).mockResolvedValue({ result: 5 })

        const res = await calculateApi(req)

        expect(res).toEqual({ result: 5 })
        expect(post).toHaveBeenCalledWith('/calculate', req, undefined)
    })

    it('forwards the abort signal', async () => {
        const req: CalcRequest = { operation: 'divide', operand1: 10, operand2: 2 }
        const controller = new AbortController()
        vi.mocked(post).mockResolvedValue({ result: 5 })

        await calculateApi(req, controller.signal)

        expect(post).toHaveBeenCalledWith('/calculate', req, controller.signal)
    })
})
