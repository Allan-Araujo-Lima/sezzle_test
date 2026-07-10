import type { HistoryEntry } from "../../../interfaces/calculator";
import { OPERATOR_SYMBOLS } from "../utils/operators";

type HistoryProps = {
    entries: HistoryEntry[]
    onSelect: (value: number) => void
    onClear: () => void
}

export function History({ entries, onSelect, onClear }: HistoryProps) {
    return (
        <aside className="calculator-history">
            <header className="calculator-history__head">
                <span>History</span>
                {entries.length > 0 && (
                    <button type="button" className="calculator-history__clear" onClick={onClear}>
                        Clear
                    </button>
                )}
            </header>

            {entries.length === 0 ? (
                <p className="calculator-history__empty">No calculations yet</p>
            ) : (
                <ul className="calculator-history__list">
                    {entries.map((entry) => (
                        <li key={entry.id}>
                            <button
                                type="button"
                                className="calculator-history__item"
                                onClick={() => onSelect(entry.result)}
                                title="Use this result in the calculator"
                            >
                                <span className="calculator-history__expr">
                                    {entry.operand1} {OPERATOR_SYMBOLS[entry.operation]} {entry.operand2}
                                </span>
                                <span className="calculator-history__result">= {entry.result}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    )
}
