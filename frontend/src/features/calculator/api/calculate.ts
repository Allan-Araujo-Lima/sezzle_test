import type { CalcRequest, CalcResponse } from '../../../interfaces/calculator'
import { post } from '../../../lib/http'

export function calculateApi(req: CalcRequest, signal?: AbortSignal) {
    return post<CalcResponse, CalcRequest>('/calculate', req, signal)
}