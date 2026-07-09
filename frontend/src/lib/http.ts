const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export class HttpError extends Error {
    status: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
        this.name = 'HttpError'
    }
}

export async function post<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    signal?: AbortSignal,
): Promise<TResponse> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
    })

    if (!res.ok) {
        // o handler Go devolve { error: "..." } em 400
        const message = await res
            .json()
            .then((data) => data?.error ?? res.statusText)
            .catch(() => res.statusText)
        throw new HttpError(res.status, message)
    }

    return res.json() as Promise<TResponse>
}