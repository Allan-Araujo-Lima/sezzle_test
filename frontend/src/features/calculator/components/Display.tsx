type DisplayProps = {
    value: string
    error: string | null
    isLoading: boolean
}

export function Display({ value, error, isLoading }: DisplayProps) {
    return (
        <div className="calculator-display">
            <span>{isLoading ? '...' : value}</span>
            {error && <small>{error}</small>}
        </div>
    )
}