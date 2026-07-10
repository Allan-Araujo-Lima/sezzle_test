import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpError, post } from './http'

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
    const fetchMock = vi.fn().mockResolvedValue(response)
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
}

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe('post', () => {
    it('sends a JSON POST and returns the parsed body on success', async () => {
        const fetchMock = mockFetch({
            ok: true,
            json: () => Promise.resolve({ result: 5 }),
        })

        const data = await post<{ result: number }>('/calculate', {
            operation: 'add',
            operand1: 2,
            operand2: 3,
        })

        expect(data).toEqual({ result: 5 })

        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toContain('/calculate')
        expect(init.method).toBe('POST')
        expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
        expect(JSON.parse(init.body)).toEqual({
            operation: 'add',
            operand1: 2,
            operand2: 3,
        })
    })

    it('throws HttpError with the API error message when the response is not ok', async () => {
        mockFetch({
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            json: () => Promise.resolve({ error: 'division by zero' }),
        })

        await expect(post('/calculate', {})).rejects.toMatchObject({
            name: 'HttpError',
            status: 400,
            message: 'division by zero',
        })
    })

    it('falls back to statusText when the error body is not valid JSON', async () => {
        mockFetch({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: () => Promise.reject(new Error('not json')),
        })

        await expect(post('/calculate', {})).rejects.toMatchObject({
            status: 500,
            message: 'Internal Server Error',
        })
    })

    it('forwards the abort signal to fetch', async () => {
        const fetchMock = mockFetch({
            ok: true,
            json: () => Promise.resolve({ result: 1 }),
        })
        const controller = new AbortController()

        await post('/calculate', {}, controller.signal)

        expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal)
    })
})

describe('HttpError', () => {
    it('carries the status code and message', () => {
        const err = new HttpError(404, 'not found')
        expect(err).toBeInstanceOf(Error)
        expect(err.status).toBe(404)
        expect(err.message).toBe('not found')
        expect(err.name).toBe('HttpError')
    })
})
