type ButtonProps = {
    children: React.ReactNode
    onClick: () => void
    disabled?: boolean
    variant?: 'number' | 'operation' | 'equals' | 'action'
}

export function Button({ children, onClick, disabled = false, variant = 'number' }: ButtonProps) {
    return (
        <button
            type="button"
            className={`calculator-button calculator-button--${variant}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    )
}