import { useCallback, useEffect, useRef, useState } from "react";
import type { CalculatorState, HistoryEntry, Operator } from "../../../interfaces/calculator";
import { calculateApi } from "../api/calculate";

const MAX_HISTORY_ENTRIES = 30;

const initialState: CalculatorState = {
    operand1: 0,
    operand2: 0,
    operation: 'add',
    result: null,
    displayValue: '0',
    activeOperand: 'operand1',
    shouldResetDisplay: false,
};

const MAX_DISPLAY_LENGTH = 16;

function parseDisplayValue(displayValue: string) {
    const value = Number(displayValue);
    return Number.isFinite(value) ? value : 0;
}

function formatDisplayValue(value: number) {
    if (!Number.isFinite(value)) return '0';

    return Number(value.toPrecision(12)).toString();
}

function setActiveOperandValue(state: CalculatorState, displayValue: string): CalculatorState {
    const value = parseDisplayValue(displayValue);

    return {
        ...state,
        displayValue,
        result: null,
        [state.activeOperand]: value,
    };
}

function isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === 'AbortError';
}

function shouldIgnoreKeyboardEvent(event: KeyboardEvent) {
    if (!(event.target instanceof HTMLElement)) return false;

    const tagName = event.target.tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' || event.target.isContentEditable;
}

export function useCalculator() {
    const [state, setState] = useState<CalculatorState>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const abortRef = useRef<AbortController | null>(null);
    const requestIdRef = useRef(0);
    const historyIdRef = useRef(0);

    const updateOperand1 = useCallback((operand1: number) => {
        setError(null);
        setState((prevState) => ({
            ...prevState,
            operand1,
            displayValue: prevState.activeOperand === 'operand1'
                ? formatDisplayValue(operand1)
                : prevState.displayValue,
            result: null,
        }));
    }, []);

    const updateOperand2 = useCallback((operand2: number) => {
        setError(null);
        setState((prevState) => ({
            ...prevState,
            operand2,
            displayValue: prevState.activeOperand === 'operand2'
                ? formatDisplayValue(operand2)
                : prevState.displayValue,
            result: null,
        }));
    }, []);

    const updateOperation = useCallback((operation: CalculatorState["operation"]) => {
        setError(null);
        setState((prevState) => ({ ...prevState, operation, result: null }));
    }, []);

    const inputDigit = useCallback((digit: string) => {
        if (!/^\d$/.test(digit)) return;

        setError(null);
        setState((prevState) => {
            const shouldReplaceDisplay = prevState.shouldResetDisplay || prevState.displayValue === '0';
            const displayValue = shouldReplaceDisplay
                ? digit
                : `${prevState.displayValue}${digit}`.slice(0, MAX_DISPLAY_LENGTH);

            return setActiveOperandValue({
                ...prevState,
                shouldResetDisplay: false,
            }, displayValue);
        });
    }, []);

    const inputDecimal = useCallback(() => {
        setError(null);
        setState((prevState) => {
            if (prevState.shouldResetDisplay) {
                return setActiveOperandValue({
                    ...prevState,
                    shouldResetDisplay: false,
                }, '0.');
            }

            if (prevState.displayValue.includes('.')) return prevState;

            return setActiveOperandValue(prevState, `${prevState.displayValue}.`);
        });
    }, []);

    const chooseOperation = useCallback((operation: Operator) => {
        setError(null);
        setState((prevState) => {
            const activeValue = parseDisplayValue(prevState.displayValue);
            const stateWithCurrentValue: CalculatorState = {
                ...prevState,
                [prevState.activeOperand]: activeValue,
                operation,
                result: null,
            };

            if (operation === 'square') {
                return {
                    ...stateWithCurrentValue,
                    operand1: activeValue,
                    activeOperand: 'operand1',
                    shouldResetDisplay: true,
                };
            }

            return {
                ...stateWithCurrentValue,
                activeOperand: 'operand2',
                shouldResetDisplay: true,
            };
        });
    }, []);

    const toggleSign = useCallback(() => {
        setError(null);
        setState((prevState) => {
            if (prevState.displayValue === '0') return prevState;

            const displayValue = prevState.displayValue.startsWith('-')
                ? prevState.displayValue.slice(1)
                : `-${prevState.displayValue}`;

            return setActiveOperandValue(prevState, displayValue);
        });
    }, []);

    const backspace = useCallback(() => {
        setError(null);
        setState((prevState) => {
            if (prevState.shouldResetDisplay) {
                return setActiveOperandValue({
                    ...prevState,
                    shouldResetDisplay: false,
                }, '0');
            }

            const displayValue = prevState.displayValue.length <= 1 ||
                (prevState.displayValue.startsWith('-') && prevState.displayValue.length === 2)
                ? '0'
                : prevState.displayValue.slice(0, -1);

            return setActiveOperandValue(prevState, displayValue);
        });
    }, []);

    const calculate = useCallback(async () => {
        abortRef.current?.abort();

        const controller = new AbortController();
        const requestId = requestIdRef.current + 1;
        abortRef.current = controller;
        requestIdRef.current = requestId;

        const activeValue = parseDisplayValue(state.displayValue);
        const request = {
            operand1: state.activeOperand === 'operand1' ? activeValue : state.operand1,
            operand2: state.activeOperand === 'operand2' ? activeValue : state.operand2,
            operation: state.operation,
        };

        setIsLoading(true);
        setError(null);

        try {
            const response = await calculateApi(request, controller.signal);

            if (requestIdRef.current !== requestId) return;

            historyIdRef.current += 1;
            const entry: HistoryEntry = {
                id: historyIdRef.current,
                operand1: request.operand1,
                operand2: request.operand2,
                operation: request.operation,
                result: response.result,
            };
            setHistory((prevHistory) => [entry, ...prevHistory].slice(0, MAX_HISTORY_ENTRIES));

            setState((prevState) => ({
                ...prevState,
                ...request,
                operand1: response.result,
                result: response.result,
                displayValue: formatDisplayValue(response.result),
                activeOperand: 'operand1',
                shouldResetDisplay: true,
            }));
        } catch (err) {
            if (isAbortError(err)) return;
            if (requestIdRef.current !== requestId) return;

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            if (requestIdRef.current === requestId) {
                setIsLoading(false);
            }
        }
    }, [
        state.activeOperand,
        state.displayValue,
        state.operand1,
        state.operand2,
        state.operation,
    ]);

    const clear = useCallback(() => {
        abortRef.current?.abort();
        requestIdRef.current += 1;
        setState(initialState);
        setIsLoading(false);
        setError(null);
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    const recallValue = useCallback((value: number) => {
        abortRef.current?.abort();
        requestIdRef.current += 1;
        setIsLoading(false);
        setError(null);
        setState({
            ...initialState,
            operand1: value,
            displayValue: formatDisplayValue(value),
            shouldResetDisplay: true,
        });
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (shouldIgnoreKeyboardEvent(event)) return;

        if (/^\d$/.test(event.key)) {
            event.preventDefault();
            inputDigit(event.key);
            return;
        }

        if (event.key === '.' || event.key === ',') {
            event.preventDefault();
            inputDecimal();
            return;
        }

        if (event.key === 'Backspace') {
            event.preventDefault();
            backspace();
            return;
        }

        if (event.key === 'Escape' || event.key === 'Delete') {
            event.preventDefault();
            clear();
            return;
        }

        if (event.key === 'Enter' || event.key === '=') {
            event.preventDefault();
            void calculate();
            return;
        }

        const operationsByKey: Partial<Record<string, Operator>> = {
            '+': 'add',
            '-': 'subtract',
            '*': 'multiply',
            x: 'multiply',
            X: 'multiply',
            '/': 'divide',
            '^': 'exponent',
            '%': 'percent',
        };
        const operation = operationsByKey[event.key];

        if (operation) {
            event.preventDefault();
            chooseOperation(operation);
        }
    }, [
        backspace,
        calculate,
        chooseOperation,
        clear,
        inputDecimal,
        inputDigit,
    ]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    useEffect(() => {
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    return {
        state,
        isLoading,
        error,
        history,
        inputDigit,
        inputDecimal,
        chooseOperation,
        toggleSign,
        backspace,
        updateOperand1,
        updateOperand2,
        updateOperation,
        calculate,
        clear,
        clearHistory,
        recallValue,
    };
}
