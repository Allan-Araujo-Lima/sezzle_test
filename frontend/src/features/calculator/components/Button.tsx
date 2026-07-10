type ButtonProps = {
    children: React.ReactNode
    onClick: () => void
    disabled?: boolean
    isActive?: boolean
    variant?: 'number' | 'operation' | 'equals' | 'action' | 'function'
}

export function Button({ children, onClick, disabled = false, isActive = false, variant = 'number' }: ButtonProps) {
    const className = [
        'calculator-button',
        `calculator-button--${variant}`,
        isActive ? 'calculator-button--active' : '',
    ].filter(Boolean).join(' ')

    return (
        <button
            type="button"
            className={className}
            onClick={onClick}
            disabled={disabled}
            aria-pressed={isActive}
        >
            {children}
        </button>
    )
}