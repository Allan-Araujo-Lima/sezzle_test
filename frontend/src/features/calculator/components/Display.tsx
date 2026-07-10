type DisplayProps = {
    value: string
    expression: string
    error: string | null
    isLoading: boolean
}

export function Display({ value, expression, error, isLoading }: DisplayProps) {
    return (
        <div className="calculator-display">
            <span className="calculator-expression">{expression}</span>
            <span className="calculator-value">{isLoading ? '…' : value}</span>
            {error && <small>{error}</small>}
        </div>
    )
}
